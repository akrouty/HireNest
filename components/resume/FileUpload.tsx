"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
}

export function FileUpload({ onFileSelect, accept = ".pdf,.docx", maxSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else if (e.type === "dragleave") {
      setIsDragging(false)
    }
  }, [])

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
      return false
    }

    const acceptedTypes = accept.split(",").map((type) => type.trim())
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Please upload a file in ${accept} format`)
      return false
    }

    setError(null)
    return true
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          setSelectedFile(file)
          onFileSelect(file)
        }
      }
    },
    [onFileSelect, maxSize, accept],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/30",
          error && "border-destructive",
        )}
      >
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          accept={accept}
          onChange={handleFileInput}
          disabled={!!selectedFile}
        />

        {!selectedFile ? (
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center px-6 py-12 cursor-pointer">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0284c7]">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-semibold mb-2">Drop your resume here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <p className="text-xs text-muted-foreground">Supports PDF and DOCX (max {maxSize / (1024 * 1024)}MB)</p>
          </label>
        ) : (
          <div className="flex items-center justify-between px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0284c7]">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}
