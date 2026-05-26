"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import UploadBox from "@/components/UploadBox";
import LoadingSpinner from "@/components/LoadingSpinner";
import BeforeAfter from "@/components/BeforeAfter";
import HowItWorks from "@/components/HowItWorks";
import ExampleImages from "@/components/ExampleImages";
import FAQ from "@/components/FAQ";
import { createHDDownloadUrl } from "@/lib/utils";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultraHD, setUltraHD] = useState(false);
  const [sharpening, setSharpening] = useState(false);
  const [originalName, setOriginalName] = useState<string>("image");
  const processedBlobRef = useRef<Blob | null>(null);
  const downloadUrlsRef = useRef<{ standard: string; ultraHD: string }>({ standard: "", ultraHD: "" });

  const runSharpenPipeline = useCallback(
    async (file: File, blob: Blob, ultra: boolean) => {
      setSharpening(true);
      try {
        return await createHDDownloadUrl(file, blob, ultra);
      } catch (err) {
        console.error("Sharpening failed, using original:", err);
        return URL.createObjectURL(blob);
      } finally {
        setSharpening(false);
      }
    },
    []
  );

  const handleImageSelected = useCallback(
    (file: File) => {
      setSelectedFile(file);
      setOriginalUrl(URL.createObjectURL(file));
      setProcessedUrl(null);
      setDisplayUrl(null);
      setError(null);
      setLoading(true);
      setOriginalName(file.name.replace(/\.[^/.]+$/, ""));
      processedBlobRef.current = null;
      downloadUrlsRef.current = { standard: "", ultraHD: "" };

      const formData = new FormData();
      formData.append("image", file);

      fetch("/api/remove-bg", { method: "POST", body: formData })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Failed to remove background");
          }
          const blob = await res.blob();
          processedBlobRef.current = blob;

          const standardUrl = await runSharpenPipeline(file, blob, false);
          downloadUrlsRef.current.standard = standardUrl;
          setDisplayUrl(standardUrl);
          setProcessedUrl(standardUrl);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    },
    [runSharpenPipeline]
  );

  const handleExampleSelect = useCallback(
    async (imageUrl: string) => {
      setOriginalUrl(imageUrl);
      setProcessedUrl(null);
      setDisplayUrl(null);
      setSelectedFile(null);
      setError(null);
      setLoading(true);
      setOriginalName("example");
      processedBlobRef.current = null;
      downloadUrlsRef.current = { standard: "", ultraHD: "" };

      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "example.jpg", { type: "image/jpeg" });
        setSelectedFile(file);

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/remove-bg", { method: "POST", body: formData });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to remove background");
        }

        const resultBlob = await res.blob();
        processedBlobRef.current = resultBlob;

        const standardUrl = await runSharpenPipeline(file, resultBlob, false);
        downloadUrlsRef.current.standard = standardUrl;
        setDisplayUrl(standardUrl);
        setProcessedUrl(standardUrl);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [runSharpenPipeline]
  );

  const handleUltraHDToggle = useCallback(async () => {
    if (!selectedFile || !processedBlobRef.current) return;

    const newUltraHD = !ultraHD;
    setUltraHD(newUltraHD);

    if (newUltraHD && !downloadUrlsRef.current.ultraHD) {
      const url = await runSharpenPipeline(selectedFile, processedBlobRef.current, true);
      downloadUrlsRef.current.ultraHD = url;
      setDisplayUrl(url);
      setProcessedUrl(url);
    } else if (newUltraHD && downloadUrlsRef.current.ultraHD) {
      setDisplayUrl(downloadUrlsRef.current.ultraHD);
      setProcessedUrl(downloadUrlsRef.current.ultraHD);
    } else {
      setDisplayUrl(downloadUrlsRef.current.standard);
      setProcessedUrl(downloadUrlsRef.current.standard);
    }
  }, [ultraHD, selectedFile, runSharpenPipeline]);

  const handleDownload = () => {
    const url = displayUrl || processedUrl;
    if (!url) return;
    const label = ultraHD ? "ultra-hd" : "hd";
    const link = document.createElement("a");
    link.href = url;
    link.download = `${originalName}-${label}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setDisplayUrl(null);
    setError(null);
    processedBlobRef.current = null;
    downloadUrlsRef.current = { standard: "", ultraHD: "" };
  };

  useEffect(() => {
    return () => {
      if (downloadUrlsRef.current.standard) URL.revokeObjectURL(downloadUrlsRef.current.standard);
      if (downloadUrlsRef.current.ultraHD) URL.revokeObjectURL(downloadUrlsRef.current.ultraHD);
    };
  }, []);

  return (
    <main className="relative z-10 min-h-screen">
      <AnimatedBackground />

      <nav className="sticky top-0 z-50 glass border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-lg gradient-text">BG Remover</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">How it works</a>
            <a href="#faq" className="text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">FAQ</a>
          </div>
        </div>
      </nav>

      <section className="px-4 pt-16 md:pt-24 pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            Free AI-powered tool &mdash; No signup needed
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Instant <span className="gradient-text">Background Remover</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Remove image backgrounds instantly with AI. Upload any photo and get a sharp transparent PNG in seconds. No login, no limits.
          </p>
        </motion.div>
      </section>

      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {!originalUrl && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <UploadBox onImageSelected={handleImageSelected} disabled={loading} />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass rounded-2xl mt-6">
                <LoadingSpinner />
              </motion.div>
            )}
          </AnimatePresence>

          {sharpening && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 text-accent-700 text-sm font-medium">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enhancing image quality...
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
              <button onClick={handleReset} className="block mx-auto mt-2 text-red-700 underline hover:no-underline">Try again</button>
            </motion.div>
          )}

          {originalUrl && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-center">
                <UploadBox onImageSelected={handleImageSelected} disabled={loading} />
              </div>

              {displayUrl && !sharpening && (
                <>
                  <BeforeAfter original={originalUrl} processed={displayUrl} />

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <button onClick={handleDownload} className="gradient-btn px-8 py-3.5 text-base inline-flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download {ultraHD ? "Ultra HD" : "HD"} PNG
                    </button>
                    <button onClick={handleUltraHDToggle} className={`px-6 py-3.5 text-base rounded-xl border-2 inline-flex items-center justify-center gap-2 transition-all duration-300 ${ultraHD ? "border-accent-400 bg-accent-50 text-accent-700 shadow-md shadow-accent-200/50" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {ultraHD ? "Ultra HD: ON" : "Ultra HD Mode"}
                    </button>
                    <button onClick={handleReset} className="px-6 py-3.5 text-base rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Remove Another
                    </button>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Output matches original dimensions &mdash; lossless PNG
                    </span>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {!originalUrl && <ExampleImages onSelect={handleExampleSelect} />}
      <HowItWorks />
      <FAQ />

      <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-sm gradient-text">BG Remover</span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              &copy; {new Date().getFullYear()} BG Remover. All rights reserved. &mdash;{" "}
              <a href="/privacy-policy" className="hover:text-gray-600 underline">Privacy</a>
              &nbsp;&middot;&nbsp;
              <a href="/terms" className="hover:text-gray-600 underline">Terms</a>
            </p>
          </div>
        </div>
      </footer>

      {!originalUrl && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 md:hidden z-50">
          <button onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/jpeg,image/png,image/webp"; input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleImageSelected(file); }; input.click(); }} className="gradient-btn w-full py-3.5 text-sm">Upload Image</button>
        </motion.div>
      )}
    </main>
  );
}
