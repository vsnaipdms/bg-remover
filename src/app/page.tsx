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

      <footer className="relative overflow-hidden border-t border-gray-100/80 bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-100/30 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-200/50">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-lg font-bold gradient-text">BG Remover</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto md:mx-0">
                AI-powered instant background removal &mdash; free, no signup, and your privacy comes first.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                <a href="/privacy-policy" className="text-xs text-gray-400 hover:text-primary-600 transition-colors underline underline-offset-2">Privacy</a>
                <span className="text-gray-300">|</span>
                <a href="/terms" className="text-xs text-gray-400 hover:text-primary-600 transition-colors underline underline-offset-2">Terms</a>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Developer</h4>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800 text-base">Venkat Shyam.N</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Digital Marketer &bull; UI/UX Designer &bull; Graphic &amp; Web Designer &bull; Artist &bull; AI Creator
                </p>
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-gray-500 pt-1">
                  <svg className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Hyderabad, Telangana, India
                </div>
                <a href="tel:+919949994082" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors pt-0.5">
                  <svg className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +91 9949994082
                </a>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Connect</h4>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <a href="https://www.linkedin.com/in/venkatshyamn/" target="_blank" rel="noopener noreferrer" className="group w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center transition-all duration-300 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md hover:shadow-primary-200/40 hover:-translate-y-0.5">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-primary-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/VenkatShyamN" target="_blank" rel="noopener noreferrer" className="group w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center transition-all duration-300 hover:bg-accent-50 hover:border-accent-300 hover:shadow-md hover:shadow-accent-200/40 hover:-translate-y-0.5">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-accent-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="https://venkatshyamn.com/" target="_blank" rel="noopener noreferrer" className="group w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center transition-all duration-300 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md hover:shadow-primary-200/40 hover:-translate-y-0.5">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </a>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100">
                <a href="mailto:venkatshyamn@email.com" className="text-xs text-gray-400 hover:text-primary-600 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  venkatshyamn@email.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              &copy; {new Date().getFullYear()} BG Remover &mdash; Built with ❤️ by{" "}
              <a href="https://venkatshyamn.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Venkat Shyam.N</a>
              . All rights reserved.
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
