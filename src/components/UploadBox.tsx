"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { validateImage, formatFileSize } from "@/lib/utils";

interface UploadBoxProps {
  onImageSelected: (file: File) => void;
  disabled?: boolean;
}

export default function UploadBox({ onImageSelected, disabled }: UploadBoxProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateImage(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageSelected(file);
    },
    [onImageSelected]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-12
          transition-all duration-300 ease-out
          ${dragActive
            ? "border-primary-500 bg-primary-50/50 scale-[1.02]"
            : preview
            ? "border-transparent bg-transparent"
            : "border-gray-200 bg-white/60 hover:border-primary-300 hover:bg-primary-50/30 hover:shadow-lg"
          }
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        aria-label="Upload image"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
        />

        {!preview && (
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div
              animate={dragActive ? { y: -5 } : { y: 0 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center"
            >
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </motion.div>

            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drop image here or click to upload
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Supports JPG, PNG, WEBP &mdash; Max 10MB
              </p>
            </div>

            <button
              type="button"
              className="gradient-btn px-8 py-3 text-sm mt-2"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Upload Image
            </button>
          </div>
        )}

        {preview && (
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="Uploaded preview"
              className="max-h-64 rounded-xl object-contain shadow-md"
            />
            <p className="text-sm text-gray-400">
              Click or drop to replace image
            </p>
          </div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-red-500 text-center"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
