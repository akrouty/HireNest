"use client";

import { useState } from "react";
import { analyzeResume, type ResumeAnalysis } from "@/services/resume.service";

export function useResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function selectFile(selectedFile: File) {
    setFile(selectedFile);
    setAnalysis(null);
  }

  async function analyzeSelectedResume() {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      setAnalysis(await analyzeResume(file));
    } finally {
      setIsAnalyzing(false);
    }
  }

  return {
    file,
    analysis,
    isAnalyzing,
    hasResults: Boolean(analysis),
    selectFile,
    analyzeSelectedResume,
  };
}
