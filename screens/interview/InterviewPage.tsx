"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Activity, Award, BarChart3, Bot, Camera, CameraOff, CheckCircle2, Clock, Loader2, MessageSquare, Mic, MicOff, Play, Radio, RefreshCw, Send, Square, TrendingUp, UserRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCareerData } from "@/hooks/useCareerData";
import type { DashboardNotification } from "@/components/layout/Topbar";
import { endInterview, forceEndActiveInterviews, getInterviewHealth, getInterviewTranscript, getInterviewVoices, interviewWsUrl, startInterview, submitInterviewAnswer, type InterviewHealth, type InterviewSession, type InterviewTranscriptItem, type InterviewVoice } from "@/services/interview.service";

type InterviewState = "not_started" | "starting" | "live" | "reconnecting" | "ended" | "failed";
const ACTIVE_STATES: InterviewState[] = ["starting", "live", "reconnecting"];
const SERVER_SAMPLE_RATE = 16000;

type SR = { start: () => void; stop: () => void; abort: () => void; continuous: boolean; interimResults: boolean; lang: string; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null; onstart: (() => void) | null; };
function getSR(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type ConversationItem = InterviewTranscriptItem & { id: string };

// ----- Helper component -----
function InterviewResultReport({ result }: { result: Record<string, unknown> }) {
  const raw = (result as any).content_evaluation || {};
  const overall = Math.max(0, Math.min(100, Math.round(Number(result.final_score ?? result.overall_score ?? result.score ?? 0))));
  const contentScore = Math.max(0, Math.min(100, Math.round(Number(raw.content_score ?? (result as any).breakdown?.content ?? overall))));
  const metrics = [
    { label: "Technical relevance", value: contentScore, icon: TrendingUp },
    { label: "Communication", value: Math.max(0, Math.min(100, Math.round(Number(result.communication_score ?? overall)))), icon: MessageSquare },
    { label: "Delivery", value: Math.max(0, Math.min(100, Math.round(Number(result.delivery_score ?? overall)))), icon: Activity },
    { label: "Presence", value: Math.max(0, Math.min(100, Math.round(Number(result.confidence_score ?? overall)))), icon: Award },
  ];
  return (
    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex h-28 w-28 items-center justify-center rounded-full transition-[background] duration-500"
          style={{ background: "conic-gradient(#0ea5e9 " + (overall * 3.6) + "deg, #e2e8f0 0deg)" }}>
          <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-sm">
            <span className="text-3xl font-black text-slate-950">{overall}</span>
            <span className="text-[10px] font-bold uppercase text-slate-500">Overall</span>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {metrics.map((m: any) => (
          <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <m.icon className="h-4 w-4 text-sky-700" />{m.label}
              </div>
              <span className="text-sm font-black text-slate-950">{m.value}</span>
            </div>
            <Progress value={m.value} className="h-2 transition-all duration-500" />
          </div>
        ))}
      </div>
      {result.summary ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Advisory summary</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{String(result.summary)}</p>
        </div>
      ) : null}
    </div>
  );
}

function downsample(input: Float32Array, inputRate: number, outputRate: number) {
  if (inputRate === outputRate) return input;
  const ratio = inputRate / outputRate;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j += 1) sum += input[j];
    output[i] = sum / Math.max(1, end - start);
  }
  return output;
}

function floatTo16BitPcm(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

function int16ArrayToBase64(input: Int16Array) {
  const bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

// ----- Main component -----
export default function InterviewPage() {
  const { profile, detectedSkills, missingSkills, loading: careerLoading, careerReady } = useCareerData();
  const [health, setHealth] = useState<InterviewHealth | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [eventLog, setEventLog] = useState<any[]>([]);
  const [interviewState, setInterviewState] = useState<InterviewState>("not_started");
  const [phase, setPhase] = useState("idle");
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [startError, setStartError] = useState("");
  const [forceStopping, setForceStopping] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micTestBusy, setMicTestBusy] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [speechActive, setSpeechActive] = useState(false);
  const [voicePreset, setVoicePreset] = useState("Bella");
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voices, setVoices] = useState<InterviewVoice[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamAudioCtxRef = useRef<AudioContext | null>(null);
  const streamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamProcessorRef = useRef<AudioNode | null>(null);
  const streamGainRef = useRef<GainNode | null>(null);
  const audioWorkletUrlRef = useRef<string | null>(null);
  const pcmBufferRef = useRef<Int16Array[]>([]);
  const pcmSampleCountRef = useRef(0);
  const turnPcmChunksRef = useRef<Int16Array[]>([]);
  const turnPcmSampleCountRef = useRef(0);
  const micRafRef = useRef<number | null>(null);
  const micLevelRef = useRef(0);
  const speechRef = useRef<SR | null>(null);
  const answerSubmittingRef = useRef(false);
  const aiSpeakingRef = useRef(false);
  const stateRef = useRef<InterviewState>("not_started");
  const turnIndexRef = useRef<number>(0);
  const targetRole = profile?.target_job_title || profile?.professional_title || "Software Engineer";
  const contextSkills = useMemo(() => (missingSkills.length ? missingSkills : detectedSkills).slice(0, 8), [detectedSkills, missingSkills]);
  const isActive = ACTIVE_STATES.includes(interviewState);
  const currentQuestion = useMemo(() => [...conversation].reverse().find((i) => i.speaker === "ai")?.text, [conversation]);
  const captured = (finalText + " " + interim).trim();
  const busyPhases = ["processing", "transcribing", "thinking"];
  const canSubmit = Boolean(session && !aiSpeaking && !busyPhases.includes(phase) && !answerSubmittingRef.current && interviewState === "live" && connected);

  useEffect(() => { stateRef.current = interviewState; }, [interviewState]);
  useEffect(() => { aiSpeakingRef.current = aiSpeaking; }, [aiSpeaking]);

  const notifyTopbar = useCallback((title: string, description?: string, tone: DashboardNotification["tone"] = "error") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotifications((current) => [{ id, title, description, tone }, ...current].slice(0, 8));
  }, []);

  useEffect(() => {
    if (careerLoading) return;
    if (!careerReady) {
      cleanup();
      setHealth(null);
      setVoices([]);
      setVoicePreset("Bella");
      return;
    }
    if (!getSR()) notifyTopbar("Live word tracking unavailable", "Your browser does not support Web Speech. Audio will still be sent to the backend.", "warning");
    void getInterviewHealth().then(setHealth).catch(() => setHealth({ available: false, base_url: "", detail: "unavailable" }));
    void getInterviewVoices().then((data) => {
      setVoices(data.voices || []);
      const femaleDefault = (data.voices || []).find((voice) => voice.gender === "female")?.id;
      setVoicePreset(femaleDefault || data.default || "Bella");
    }).catch(() => {
      setVoices([
        { id: "Bella", label: "Bella (female)", gender: "female" },
        { id: "Luna", label: "Luna (female)", gender: "female" },
        { id: "Rosie", label: "Rosie (female)", gender: "female" },
        { id: "Kiki", label: "Kiki (female)", gender: "female" },
        { id: "Jasper", label: "Jasper (male)", gender: "male" },
      ]);
      setVoicePreset("Bella");
    });
    return () => cleanup();
  }, [careerLoading, careerReady, notifyTopbar]);

  const appendConv = useCallback((item: Omit<ConversationItem, "id">) => {
    const text = (item.text || "").trim();
    if (!text) return;
    setConversation((current) => {
      if (item.speaker === "candidate" && !item.final) {
        const idx = current.findIndex((e) => e.speaker === "candidate" && e.turn_index === item.turn_index && e.event_type === item.event_type && !e.final);
        if (idx >= 0) { const u = [...current]; u[idx] = { ...u[idx], text }; return u.slice(-80); }
      }
      if (item.speaker === "candidate" && item.final) {
        current = current.filter((e) => !(e.speaker === "candidate" && e.turn_index === item.turn_index && e.event_type === "browser.transcript.partial"));
      }
      const id = (item.event_type || item.speaker) + "-" + (item.turn_index ?? "x") + "-" + Date.now();
      if (current.some((e) => e.speaker === item.speaker && e.turn_index === item.turn_index && e.text === text)) return current;
      return [...current, { ...item, text, id }].slice(-80);
    });
  }, []);

  const stopSR = useCallback(() => {
    if (speechRef.current) { try { speechRef.current.abort(); } catch {} speechRef.current = null; }
    setSpeechActive(false);
  }, []);

  const startSR = useCallback((lang: string) => {
    if (stateRef.current === "ended" || stateRef.current === "failed") return;
    const Ctor = getSR();
    if (!Ctor) { notifyTopbar("Live word tracking unavailable", "Your browser does not support Web Speech. Audio will still be sent to the backend.", "warning"); return; }
    stopSR();
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang === "fr" ? "fr-FR" : "en-US";
    rec.onstart = () => { setSpeechActive(true); };
    rec.onerror = (e: any) => {
      setSpeechActive(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        notifyTopbar("Microphone blocked", "Allow microphone access to capture your answer.");
      }
      else if (e.error && e.error !== "no-speech" && e.error !== "aborted") {
        const message = "Speech: " + e.error;
        notifyTopbar("Speech tracking warning", message, "warning");
      }
    };
    rec.onend = () => setSpeechActive(false);
    rec.onresult = (event: any) => {
      if (stateRef.current === "ended" || stateRef.current === "failed") return;
      let interimText = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const t = String(r[0]?.transcript || "").trim();
        if (!t) continue;
        if (r.isFinal) finalChunk = finalChunk ? finalChunk + " " + t : t;
        else interimText = interimText ? interimText + " " + t : t;
      }
      if (interimText) {
        setInterim(interimText);
        appendConv({ speaker: "candidate", text: interimText, turn_index: turnIndexRef.current, final: false, event_type: "browser.transcript.partial" });
      }
      if (finalChunk) {
        setFinalText((cur) => (cur ? cur + " " + finalChunk : finalChunk));
        setInterim("");
        appendConv({ speaker: "candidate", text: finalChunk, turn_index: turnIndexRef.current, final: true, event_type: "browser.transcript.final" });
      }
    };
    try { rec.start(); speechRef.current = rec; }
    catch (e) {
      const message = e instanceof Error ? e.message : "Speech failed.";
      notifyTopbar("Speech tracking failed", message);
    }
  }, [appendConv, notifyTopbar, stopSR]);

  const sendCtrl = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !ACTIVE_STATES.includes(stateRef.current)) return false;
    ws.send(JSON.stringify({ type, ...payload }));
    return true;
  }, []);

  function cleanup() {
    stopSR();
    if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
    micRafRef.current = null;
    stopAudioStreaming();
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMicEnabled(false); setCameraEnabled(false); setConnected(false);
    setFinalText(""); setInterim("");
  }

  async function startMedia(opts: { video: boolean }) {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("No camera/mic access.");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: opts.video ? { width: 640, height: 360, frameRate: 6 } : false,
    });
    streamRef.current = stream;
    setMicEnabled(stream.getAudioTracks().some((t) => t.enabled));
    setCameraEnabled(stream.getVideoTracks().some((t) => t.enabled));
    if (videoRef.current) videoRef.current.srcObject = stream;
    startMicMeter(stream);
  }

  function startMicMeter(stream: MediaStream) {
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const src = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
    const an = ctx.createAnalyser();
    an.fftSize = 1024;
    an.smoothingTimeConstant = 0.86;
    const samples = new Uint8Array(an.fftSize);
    src.connect(an);
    audioCtxRef.current = ctx;
    const tick = () => {
      an.getByteTimeDomainData(samples);
      let sumSquares = 0;
      for (const sample of samples) {
        const centered = (sample - 128) / 128;
        sumSquares += centered * centered;
      }
      const enabled = streamRef.current?.getAudioTracks().some((t) => t.enabled) ?? false;
      const rms = Math.sqrt(sumSquares / samples.length);
      const noiseFloor = 0.025;
      const normalized = Math.max(0, (rms - noiseFloor) / 0.24);
      const target = enabled ? Math.min(100, Math.round(normalized * 100)) : 0;
      const next = target <= 1 ? 0 : Math.round(micLevelRef.current * 0.84 + target * 0.16);
      if (Math.abs(next - micLevelRef.current) >= 1 || next === 0) { micLevelRef.current = next; setMicLevel(next); }
      micRafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  async function startAudioStreaming(ws: WebSocket) {
    const stream = streamRef.current;
    if (!stream || streamAudioCtxRef.current) return;
    const tracks = stream.getAudioTracks();
    if (!tracks.length) return;
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const source = ctx.createMediaStreamSource(new MediaStream(tracks));
    const gain = ctx.createGain();
    gain.gain.value = 0;
    streamAudioCtxRef.current = ctx;
    streamSourceRef.current = source;
    streamGainRef.current = gain;
    pcmBufferRef.current = [];
    pcmSampleCountRef.current = 0;
    turnPcmChunksRef.current = [];
    turnPcmSampleCountRef.current = 0;

    const handleInput = (input: Float32Array) => {
      if (ws.readyState !== WebSocket.OPEN || stateRef.current === "ended" || aiSpeakingRef.current) return;
      const pcm = floatTo16BitPcm(downsample(input, ctx.sampleRate, SERVER_SAMPLE_RATE));
      pcmBufferRef.current.push(pcm);
      pcmSampleCountRef.current += pcm.length;
      turnPcmChunksRef.current.push(pcm);
      turnPcmSampleCountRef.current += pcm.length;
      if (pcmSampleCountRef.current >= SERVER_SAMPLE_RATE) flushPcmBuffer(ws);
    };

    if (ctx.audioWorklet) {
      try {
        const code = `
          class HireNestMicProcessor extends AudioWorkletProcessor {
            process(inputs) {
              const input = inputs[0] && inputs[0][0];
              if (input) {
                const copy = new Float32Array(input.length);
                copy.set(input);
                this.port.postMessage(copy, [copy.buffer]);
              }
              return true;
            }
          }
          registerProcessor("hirenest-mic-processor", HireNestMicProcessor);
        `;
        const url = URL.createObjectURL(new Blob([code], { type: "application/javascript" }));
        audioWorkletUrlRef.current = url;
        await ctx.audioWorklet.addModule(url);
        const node = new AudioWorkletNode(ctx, "hirenest-mic-processor");
        node.port.onmessage = (event) => handleInput(new Float32Array(event.data));
        streamProcessorRef.current = node;
        source.connect(node);
        node.connect(gain);
        gain.connect(ctx.destination);
        return;
      } catch {
        // Fall back for older or restricted browsers.
      }
    }

    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => handleInput(event.inputBuffer.getChannelData(0));
    streamProcessorRef.current = processor;
    source.connect(processor);
    processor.connect(gain);
    gain.connect(ctx.destination);
  }

  function stopAudioStreaming() {
    streamProcessorRef.current?.disconnect();
    streamSourceRef.current?.disconnect();
    streamGainRef.current?.disconnect();
    streamProcessorRef.current = null;
    streamSourceRef.current = null;
    streamGainRef.current = null;
    void streamAudioCtxRef.current?.close().catch(() => undefined);
    streamAudioCtxRef.current = null;
    if (audioWorkletUrlRef.current) URL.revokeObjectURL(audioWorkletUrlRef.current);
    audioWorkletUrlRef.current = null;
    pcmBufferRef.current = [];
    pcmSampleCountRef.current = 0;
    turnPcmChunksRef.current = [];
    turnPcmSampleCountRef.current = 0;
  }

  function flushPcmBuffer(ws: WebSocket) {
    if (!pcmSampleCountRef.current || ws.readyState !== WebSocket.OPEN) return;
    const merged = new Int16Array(pcmSampleCountRef.current);
    let offset = 0;
    for (const chunk of pcmBufferRef.current) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    pcmBufferRef.current = [];
    pcmSampleCountRef.current = 0;
    ws.send(JSON.stringify({ type: "audio.chunk", timestamp_ms: Date.now(), encoding: "pcm_s16le", sample_rate: SERVER_SAMPLE_RATE }));
    ws.send(merged.buffer);
  }

  function getTurnAudioBase64() {
    if (!turnPcmSampleCountRef.current) return "";
    const merged = new Int16Array(turnPcmSampleCountRef.current);
    let offset = 0;
    for (const chunk of turnPcmChunksRef.current) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return int16ArrayToBase64(merged);
  }

  function resetTurnAudio() {
    turnPcmChunksRef.current = [];
    turnPcmSampleCountRef.current = 0;
  }

  async function handleStart() {
    if (isActive || starting) return;
    if (!careerReady) {
      const message = "Upload, parse, and extract your CV before starting an AI interview.";
      setStartError(message);
      notifyTopbar("CV required", message, "warning");
      return;
    }
    setStarting(true); setInterviewState("starting");
    setConversation([]); setEventLog([]); setResult(null);
    setMediaError(""); setStartError(""); setFinalText(""); setInterim("");
    try {
      await startMedia({ video: true });
      const nextSession = await startInterview({ job_title: jobTitle || targetRole, consent: true, voice_preset: voicePreset, voice_speed: voiceSpeed, language: "en", question_count: 8 });
      setSession(nextSession);
      toast.success("Interview started");
      connectWS(nextSession.session_id, "start");
    } catch (err) {
      cleanup();
      setInterviewState("failed");
      const message = err instanceof Error ? err.message : "Unable to start interview";
      setStartError(message);
      notifyTopbar("Interview failed", message);
    } finally { setStarting(false); }
  }

  async function handleMicTest() {
    setMicTestBusy(true); setMediaError("");
    try { await startMedia({ video: false }); }
    catch (err) { notifyTopbar("Mic test failed", err instanceof Error ? err.message : "Unable to test mic"); }
    finally { setMicTestBusy(false); }
  }

  async function handleForceStop() {
    setForceStopping(true);
    try { cleanup(); await forceEndActiveInterviews(); setSession(null); setConversation([]); setResult(null); setInterviewState("not_started"); setStartError(""); toast.success("Active interview stopped"); }
    catch (err) { notifyTopbar("Force stop failed", err instanceof Error ? err.message : "Unable"); }
    finally { setForceStopping(false); }
  }

  function connectWS(sessionId: string, mode: "start" | "resume") {
    const ws = new WebSocket(interviewWsUrl(sessionId));
    wsRef.current = ws;
    ws.onopen = () => {
      stateRef.current = "live";
      setConnected(true);
      setInterviewState("live");
      ws.send(JSON.stringify({ type: mode === "start" ? "control.start" : "control.resume" }));
      void startAudioStreaming(ws);
    };
    ws.onmessage = (m) => {
      try { const ev = JSON.parse(String(m.data)); handleEvent(ev); }
      catch { handleEvent({ type: "message" }); }
    };
    ws.onerror = () => { if (stateRef.current !== "ended") notifyTopbar("Interview connection failed", "The realtime handshake could not stay open."); };
    ws.onclose = () => { setConnected(false); stopAudioStreaming(); };
  }

  function handleEvent(event: any) {
    setEventLog((cur) => [event, ...cur].slice(0, 12));
    if (event.type === "interview.question") {
      answerSubmittingRef.current = false;
      stopSR();
      aiSpeakingRef.current = true;
      resetTurnAudio();
      turnIndexRef.current = typeof event.turn_index === "number" ? event.turn_index : turnIndexRef.current;
      setFinalText(""); setInterim("");
      const text = String(event.text || event.question || "").trim();
      appendConv({ speaker: "ai", text, turn_index: typeof event.turn_index === "number" ? event.turn_index : null, final: true, event_type: "interview.question" });
      setAiSpeaking(true);
      const audioBase64 = typeof event.audio_base64 === "string" ? event.audio_base64 : "";
      const afterAudio = () => {
        aiSpeakingRef.current = false;
        setAiSpeaking(false);
        if (sendCtrl("control.listen")) setPhase("listening");
        startSR("en");
      };
      if (audioBase64) { const a = new Audio("data:audio/wav;base64," + audioBase64); a.onended = afterAudio; a.onerror = afterAudio; a.play().catch(afterAudio); }
      else if (event.use_browser_tts && "speechSynthesis" in window && text) {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = Math.max(0.75, Math.min(1.25, Number(event.voice_speed ?? voiceSpeed)));
        u.onend = afterAudio; u.onerror = afterAudio; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
      } else { setTimeout(afterAudio, 50); }
      return;
    }
    if (event.type === "interview.answer" || event.type === "feature.transcript") {
      if (event.type === "interview.answer") { setFinalText(""); setInterim(""); answerSubmittingRef.current = false; resetTurnAudio(); }
      appendConv({ speaker: "candidate", text: String(event.answer || event.transcript || event.text || ""), turn_index: typeof event.turn_index === "number" ? event.turn_index : null, final: event.type === "interview.answer", event_type: event.type });
      return;
    }
    if (event.type === "interview.phase") { setPhase(String(event.phase || "live")); return; }
    if (event.type === "interview.complete") { setPhase("complete"); appendConv({ speaker: "system", text: "Interview complete.", final: true, event_type: "interview.complete" }); return; }
    if (event.type === "error") { setInterviewState("failed"); notifyTopbar("Interview error", String(event.message || "Realtime error")); }
  }

  async function handleDoneSpeaking() {
    if (!session || answerSubmittingRef.current) return;
    answerSubmittingRef.current = true;
    stopSR();
    const text = captured;
    const turnIndex = turnIndexRef.current;
    if (text) appendConv({ speaker: "candidate", text, turn_index: turnIndex, final: true, event_type: "interview.answer" });
    setFinalText(""); setInterim("");
    setPhase("processing");
    const sessionId = session.session_id;
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) flushPcmBuffer(ws);
    const audioBase64 = getTurnAudioBase64();
    const audioDurationSec = turnPcmSampleCountRef.current / SERVER_SAMPLE_RATE;
    const answerPayload = audioBase64
      ? { answer: text, audio_base64: audioBase64, audio_encoding: "pcm_s16le", sample_rate: SERVER_SAMPLE_RATE }
      : { answer: text };
    if (!text) {
      if (!audioBase64) {
        answerSubmittingRef.current = false;
        setPhase("listening");
        toast.info("No speech captured yet", { description: "Speak for at least five seconds, then click Done Speaking." });
        return;
      }
      if (audioDurationSec < 1) {
        answerSubmittingRef.current = false;
        setPhase("listening");
        toast.info("Not enough audio captured", { description: "Speak a little longer before sending." });
        return;
      }
      if (!sendCtrl("control.answer_done", answerPayload)) {
        answerSubmittingRef.current = false;
        setPhase("listening");
        notifyTopbar("Unable to send answer", "Realtime connection is not open.");
      }
      return;
    }
    if (sendCtrl("control.answer_done", answerPayload)) {
      toast.success("Answer submitted", { description: "Processing your response..." });
      return;
    }
    try {
      await submitInterviewAnswer(sessionId, { text, source: "browser" });
      toast.success("Answer submitted", { description: "Processing your response..." });
    } catch (err) {
        answerSubmittingRef.current = false;
        setPhase("listening");
        notifyTopbar("Failed to submit answer", err instanceof Error ? err.message : "Unable to submit answer.");
    }
  }

  function toggleMic() {
    if (!streamRef.current) return;
    const next = !micEnabled;
    streamRef.current.getAudioTracks().forEach((t) => { t.enabled = next; });
    setMicEnabled(next);
  }

  function toggleCamera() {
    if (!streamRef.current) return;
    const next = !cameraEnabled;
    streamRef.current.getVideoTracks().forEach((t) => { t.enabled = next; });
    setCameraEnabled(next);
  }

  async function handleEnd() {
    if (!session || ending) return;
    setEnding(true);
    try {
      stopSR(); sendCtrl("control.end");
      const report = await endInterview(session.session_id);
      setResult(report);
      setSession({ ...session, status: "completed", result: report, final_score: Number(report.final_score ?? report.overall_score ?? 0) });
      setInterviewState("ended");
      const history = await getInterviewTranscript(session.session_id).catch(() => null);
      if (history && history.items && history.items.length) setConversation(history.items.map((it, i) => ({ ...it, id: "history-" + i })));
      toast.success("Interview completed");
    } catch (err) {
      notifyTopbar("Interview end failed", err instanceof Error ? err.message : "Unable to end");
    } finally { setEnding(false); }
  }

  function cleanDisplayText(value: unknown) {
    let text = typeof value === "string" ? value : JSON.stringify(value ?? "");
    text = text.trim();
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        const record = parsed as Record<string, unknown>;
        for (const key of ["question", "text", "prompt", "answer", "transcript", "message", "followup_question"]) {
          if (typeof record[key] === "string" && (record[key] as string).trim()) return cleanDisplayText(record[key]);
        }
      }
    } catch {}
    return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").replace(/^["']|["']$/g, "").replace(/\n/g, " ").replace(/\"/g, '"').replace(/\s+/g, " ").trim();
  }

  const statusLabel = { not_started: "Ready", starting: "Starting", live: "Live", reconnecting: "Reconnecting", ended: "Ended", failed: "Needs attention" }[interviewState];
  const micStatus = mediaError
    ? { label: "No permission", detail: "Allow microphone access.", className: "bg-amber-50 text-amber-700" }
    : !streamRef.current?.getAudioTracks().length
      ? { label: "No mic", detail: "Run a quick mic check.", className: "bg-slate-100 text-slate-600" }
      : !micEnabled
        ? { label: "Mic ready", detail: "Input is available.", className: "bg-sky-50 text-sky-700" }
        : micLevel > 15
          ? { label: "Input active", detail: "Microphone level is moving.", className: "bg-emerald-50 text-emerald-700" }
          : { label: "Silence", detail: "Room is quiet.", className: "bg-slate-100 text-slate-600" };

  return (
    <DashboardLayout notifications={notifications}>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">AI Video Interview</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">Practice a live structured interview with real prompts, captions, and multimodal scoring.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={careerReady && health?.available ? "rounded-xl bg-emerald-50 px-4 py-2 text-emerald-700" : "rounded-xl bg-amber-50 px-4 py-2 text-amber-700"}>{!careerReady ? "CV required" : health?.available ? "AI module online" : "AI module unavailable"}</Badge>
            <Badge className={connected ? "rounded-xl bg-sky-50 px-4 py-2 text-sky-700" : "rounded-xl bg-slate-100 px-4 py-2 text-slate-600"}>{statusLabel}</Badge>
          </div>
        </section>

        {startError.includes("active interview session") ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><p>{startError}</p>
            </div>
            <Button variant="outline" className="h-10 rounded-xl border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
              disabled={forceStopping} onClick={() => void handleForceStop()}>
              {forceStopping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Square className="mr-2 h-4 w-4" />}Force stop
            </Button>
          </div>
        ) : null}

        {!careerLoading && !careerReady ? (
          <Card className="rounded-2xl border-sky-100 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-950">Upload and extract your CV first</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                    The AI interview needs real resume skills and extracted profile context. The interview module, voice list, and session start stay locked until your CV is parsed and extracted.
                  </p>
                </div>
              </div>
              <Button asChild className="rounded-xl bg-[#020817] hover:bg-slate-800">
                <Link href="/resume">Go to Resume</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="relative min-h-[420px] bg-[#020817]">
                  <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover opacity-80" />
                  {!cameraEnabled ? <div className="absolute inset-0 flex items-center justify-center bg-[#020817] text-sky-200"><Camera className="h-14 w-14" /></div> : null}
                  <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur md:left-auto md:w-[300px]">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase text-sky-200">Realtime handshake</p>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]" />
                    </div>
                    <div className="space-y-1.5">
                      {eventLog.length ? eventLog.slice(0, 4).map((event, idx) => (
                        <div key={(event.type || "e") + idx} className="flex items-center justify-between gap-2 rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] text-white/85">
                          <span className="truncate font-semibold">{event.type || "message"}</span>
                          {event.message ? <span className="max-w-[110px] truncate text-white/60">{cleanDisplayText(event.message)}</span> : null}
                        </div>
                      )) : (
                        <p className="rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] text-white/70">Waiting for realtime connection.</p>
                      )}
                    </div>
                  </div>
                  <div className="absolute left-5 right-5 top-40 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur md:right-[330px] md:top-5">
                    <p className="text-xs font-bold uppercase text-sky-200">Current AI prompt</p>
                    <p className="mt-1 text-sm leading-6">{currentQuestion ? cleanDisplayText(currentQuestion) : "Start the session to receive the first interview question."}</p>
                  </div>
                  <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                    <Badge className={connected ? "bg-emerald-500" : "bg-slate-500"}><Radio className="mr-1 h-3 w-3" />{connected ? "Connected" : "Offline"}</Badge>
                    <Badge className={micEnabled ? "bg-sky-500" : "bg-slate-500"}>{micEnabled ? "Mic on" : "Mic off"}</Badge>
                    <Badge className={cameraEnabled ? "bg-sky-500" : "bg-slate-500"}>{cameraEnabled ? "Camera on" : "Camera off"}</Badge>
                    <Badge className="bg-white/20 text-white">{phase}</Badge>
                    {aiSpeaking ? <Badge className="bg-amber-500">AI speaking</Badge> : null}
                    {speechActive ? <Badge className="bg-emerald-500">Listening</Badge> : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white" disabled={!careerReady || !streamRef.current || interviewState === "ended"} onClick={toggleMic}>
                {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white" disabled={!careerReady || !streamRef.current || interviewState === "ended"} onClick={toggleCamera}>
                {cameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
              </Button>
              <div className="flex flex-col items-center gap-2">
                <Button variant="outline" className="h-14 rounded-2xl bg-white" disabled={!canSubmit} onClick={() => void handleDoneSpeaking()}>
                  <Send className="mr-2 h-4 w-4" />Done Speaking
                </Button>
                {interviewState === "live" ? (
                  <div className="flex min-h-5 items-center gap-2 text-xs font-medium text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {aiSpeaking ? "AI speaking..." : speechActive ? "Capturing your answer" : phase === "processing" ? "Processing..." : "Waiting for your turn"}
                  </div>
                ) : null}
              </div>
              {!session || interviewState === "ended" || interviewState === "failed" ? (
                <Button className="h-14 w-full rounded-2xl bg-[#020817] sm:w-auto sm:min-w-[220px]" disabled={!careerReady || careerLoading || starting || health?.available === false} onClick={() => void handleStart()}>
                  {starting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}Start AI Interview
                </Button>
              ) : (
                <Button className="h-14 w-full rounded-2xl bg-red-600 hover:bg-red-700 sm:w-auto sm:min-w-[220px]" disabled={ending} onClick={() => void handleEnd()}>
                  {ending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Square className="mr-2 h-4 w-4" />}End & Score
                </Button>
              )}
            </div>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-950"><MessageSquare className="h-5 w-5 text-sky-700" />Live Transcript</CardTitle>
                {interviewState === "reconnecting" ? (
                  <Badge className="rounded-xl bg-amber-50 text-amber-700"><RefreshCw className="mr-1 h-3 w-3 animate-spin" />Reconnecting</Badge>
                ) : speechActive ? (
                  <Badge className="rounded-xl bg-emerald-50 text-emerald-700"><Mic className="mr-1 h-3 w-3" />Live word tracking</Badge>
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
                  {conversation.length ? conversation.map((item) => (
                    <div key={item.id} className={"flex animate-in gap-3 fade-in slide-in-from-bottom-1 duration-200 " + (item.speaker === "candidate" ? "justify-end" : "justify-start")}>
                      {item.speaker !== "candidate" ? (
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                          {item.speaker === "ai" ? <Bot className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </div>
                      ) : null}
                      <div className={"max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 " + (item.speaker === "candidate" ? "bg-[#020817] text-white" : item.speaker === "system" ? "border border-emerald-100 bg-emerald-50 text-emerald-800" : "border border-slate-200 bg-slate-50 text-slate-700")}>
                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase opacity-75">
                          {item.speaker === "candidate" ? "You" : item.speaker === "ai" ? "AI Interviewer" : "Session"}
                          {typeof item.turn_index === "number" ? <span>Turn {item.turn_index + 1}</span> : null}
                          {!item.final ? <span>Live</span> : null}
                        </div>
                        <p>{cleanDisplayText(item.text)}</p>
                      </div>
                      {item.speaker === "candidate" ? (
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><UserRound className="h-4 w-4" /></div>
                      ) : null}
                    </div>
                  )) : (
                    <p className="text-sm leading-6 text-slate-500">No conversation yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardHeader><CardTitle>Interview Setup</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input className="h-11 rounded-xl" placeholder={targetRole} value={jobTitle} disabled={!careerReady || isActive} onChange={(e) => setJobTitle(e.target.value)} />
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-500">AI interviewer voice</p>
                  <Select value={voicePreset} disabled={!careerReady || isActive} onValueChange={setVoicePreset}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50">
                      <SelectValue placeholder="Choose voice tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.label || voice.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">Voice speed</p>
                      <p className="mt-1 text-xs text-slate-500">Controls the AI interviewer speaking pace.</p>
                    </div>
                    <Badge className="rounded-xl bg-white px-3 py-1.5 text-slate-700">{voiceSpeed.toFixed(2)}x</Badge>
                  </div>
                  <Slider
                    value={[voiceSpeed]}
                    min={0.75}
                    max={1.25}
                    step={0.05}
                    disabled={!careerReady || isActive}
                    onValueChange={(value) => setVoiceSpeed(Number(value[0] ?? 1))}
                  />
                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span>Slower</span>
                    <span>Natural</span>
                    <span>Faster</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700"><Mic className="h-4 w-4" /></div>
                      <div><p className="text-sm font-semibold text-slate-950">Mic test</p><p className="text-xs text-slate-500">{micStatus.detail}</p></div>
                    </div>
                    <Badge className={"rounded-xl px-3 py-1.5 " + micStatus.className}>{micStatus.label}</Badge>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full transition-[width,background-color] duration-100"
                      style={{ width: micLevel + "%", backgroundColor: micLevel > 15 ? "#10b981" : "#0ea5e9" }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-slate-500">{micLevel}% input</span>
                    <Button variant="outline" className="h-9 rounded-xl bg-white" disabled={!careerReady || isActive || micTestBusy} onClick={() => void handleMicTest()}>
                      {micTestBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}Check Mic
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contextSkills.length ? contextSkills.map((skill) => (
                    <Badge key={skill} className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50">{skill}</Badge>
                  )) : (
                    <span className="text-sm text-slate-500">Upload a CV for interview context.</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2 text-sky-800"><BarChart3 className="h-5 w-5" />Result</CardTitle></CardHeader>
              <CardContent>{result ? <InterviewResultReport result={result} /> : <p className="text-sm text-slate-500">Complete a session to see scoring.</p>}</CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </DashboardLayout>
  );
}
