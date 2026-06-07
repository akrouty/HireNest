"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getMyResume,
  getMyResumeEvaluation,
  getMyResumeFileBlob,
  parseMyResume,
  deleteMyResume,
  uploadResume,
  type ResumeEvaluation,
  type ResumeRecord,
} from "@/services/resume.service";
import {
  extractMyCV,
  getMyCVExtraction,
  type CVExtraction,
} from "@/services/cv-extraction.service";
import { getMyProfile } from "@/services/profile.service";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { ApiError } from "@/services/api";

export function useResumeUpload() {
  const { isOffline, blockIfOffline } = useOfflineStatus();
  const [file, setFile] = useState<File | null>(null);
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [extraction, setExtraction] = useState<CVExtraction | null>(null);
  const [evaluation, setEvaluation] = useState<ResumeEvaluation | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadResumeState() {
      if (isOffline) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const currentResume = await getMyResume().catch((err) => {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        });
        const currentExtraction = await getMyCVExtraction().catch((err) => {
          if (err instanceof ApiError && [400, 404].includes(err.status)) {
            return null;
          }
          throw err;
        });
        const currentEvaluation = currentResume
          ? await getMyResumeEvaluation().catch((err) => {
              if (err instanceof ApiError && [400, 404].includes(err.status)) return null;
              throw err;
            })
          : null;
        if (!mounted) return;
        setResume(currentResume);
        setExtraction(currentExtraction);
        setEvaluation(currentEvaluation);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load resume state";
        if (!mounted) return;
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadResumeState();
    return () => {
      mounted = false;
    };
  }, [isOffline]);

  useEffect(() => {
    let revokedUrl: string | null = null;
    if (!resume || isOffline) {
      setResumePreviewUrl(null);
      return;
    }
    getMyResumeFileBlob()
      .then((blob) => {
        revokedUrl = URL.createObjectURL(blob);
        setResumePreviewUrl(revokedUrl);
      })
      .catch(() => setResumePreviewUrl(null));
    return () => {
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
  }, [resume, isOffline]);

  function selectFile(selectedFile: File) {
    setFile(selectedFile);
    setError(null);
  }

  async function analyzeSelectedResume() {
    if (blockIfOffline("CV upload and parsing")) return;

    setError(null);
    setIsAnalyzing(true);
    try {
      if (file) {
        toast.loading("Uploading CV...", { id: "resume-upload" });
        const uploaded = await uploadResume(file);
        setResume(uploaded);
        setExtraction(null);
        setEvaluation(null);
        toast.success("CV uploaded", {
          id: "resume-upload",
          description: uploaded.original_filename,
        });
      }

      toast.loading("Parsing CV...", { id: "resume-parse" });
      const parsed = await parseMyResume();
      setResume((current) =>
        current
          ? { ...current, parsing_status: parsed.parsing_status }
          : current,
      );
      toast.success("CV parsing completed", {
        id: "resume-parse",
        description: `${parsed.extracted_text_length} characters extracted.`,
      });

      toast.loading("Extracting CV profile...", { id: "cv-extraction" });
      const extracted = await extractMyCV();
      setExtraction(extracted);
      const nextEvaluation = await getMyResumeEvaluation().catch((err) => {
        if (err instanceof ApiError && [400, 404].includes(err.status)) return null;
        throw err;
      });
      setEvaluation(nextEvaluation);

      // Attempt to refresh profile state after CV extraction
      // The backend will have auto-generated a profile from CV data
      try {
        await getMyProfile().catch((err) => {
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        });
      } catch (err) {
        // Profile refresh failure is non-critical, don't block extraction success
        console.debug("Profile refresh after CV extraction:", err);
      }

      toast.success("CV extraction completed", {
        id: "cv-extraction",
        description: "Your profile was auto-generated from CV data.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Resume analysis failed";
      setError(message);
      toast.error("CV analysis failed", { description: message });
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function removeCurrentResume() {
    if (blockIfOffline("resume removal")) return;
    setError(null);
    try {
      await deleteMyResume();
      setResume(null);
      setExtraction(null);
      setEvaluation(null);
      setFile(null);
      toast.success("Resume removed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to remove resume";
      setError(message);
      toast.error("Resume removal failed", { description: message });
    }
  }

  return {
    file,
    resume,
    extraction,
    evaluation,
    loading,
    isAnalyzing,
    isOffline,
    error,
    hasResume: Boolean(resume),
    hasParsedResume: resume?.parsing_status === "parsed",
    hasExtraction: Boolean(extraction?.skills?.length),
    resumePreviewUrl,
    selectFile,
    analyzeSelectedResume,
    removeCurrentResume,
  };
}
