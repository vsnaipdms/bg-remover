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

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-100/40 via-indigo-100/20 to-transparent blur-3xl animate-float" />
        <div className="absolute bottom-[-160px] left-[-100px] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-coral-100/30 via-warm-100/20 to-transparent blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-accent-100/20 to-brand-100/10 blur-3xl animate-float-reverse" />
        <div className="absolute inset-0 bg-grid" />
      </div>

      <nav className="sticky top-0 z-50 glass-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-extrabold text-lg tracking-tight gradient-text">BG Remover</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium hidden sm:block">How it works</a>
            <a href="#faq" className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium hidden sm:block">FAQ</a>
            <a href="#contact" className="btn-primary text-xs px-4 py-2 hidden sm:inline-flex">Contact</a>
          </div>
        </div>
      </nav>

      <section className="relative z-10 px-4 sm:px-6 pt-16 md:pt-28 pb-6 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100/60 text-brand-700 text-sm font-medium mb-7 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-soft" />
            Free AI-powered tool &mdash; No signup needed
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 leading-[1.05] text-balance">
            Instant <br className="sm:hidden" />
            <span className="gradient-text">Background Remover</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed text-balance">
            Remove image backgrounds instantly with AI. Upload any photo and get a sharp transparent PNG in seconds. <span className="text-gray-700 font-semibold">No login, no limits.</span>
          </p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Privacy Protected
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant Results
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              HD Quality
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 px-4 sm:px-6 pb-8">
        <div className="max-w-2xl mx-auto">
          {!originalUrl && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <UploadBox onImageSelected={handleImageSelected} disabled={loading} />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card rounded-2xl mt-6">
                <LoadingSpinner />
              </motion.div>
            )}
          </AnimatePresence>

          {sharpening && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-brand-50 border border-indigo-100/60 text-indigo-600 text-sm font-medium">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enhancing image quality...
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-red-50/90 backdrop-blur-sm border border-red-100 rounded-2xl text-red-600 text-sm text-center shadow-sm">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">{error}</p>
                <button onClick={handleReset} className="text-red-700 font-semibold underline hover:no-underline">Try again</button>
              </div>
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

                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <button onClick={handleDownload} className="btn-glow px-8 py-3.5 text-base">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download {ultraHD ? "Ultra HD" : "HD"} PNG
                    </button>
                    <button onClick={handleUltraHDToggle} className={`btn-secondary px-6 py-3.5 text-base ${ultraHD ? "border-brand-400 bg-brand-50 text-brand-700 shadow-sm shadow-brand-200/50" : ""}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {ultraHD ? "Ultra HD: ON" : "Ultra HD"}
                    </button>
                    <button onClick={handleReset} className="btn-secondary px-6 py-3.5 text-base">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      New Image
                    </button>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                      <svg className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Original resolution preserved &mdash; lossless PNG &mdash; 100% free
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

      <section id="contact" className="relative z-10 px-4 sm:px-6 py-16 md:py-20 bg-gradient-to-br from-brand-50/40 via-white to-indigo-50/40 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-12">
            <div className="section-label bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100/60 text-brand-700 inline-flex mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              Contact &amp; Hire
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-balance">
              Let&apos;s Work <span className="gradient-text">Together</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Have a project in mind? Let&apos;s build something amazing.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="glass-card-hover rounded-2xl p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100/60 text-brand-700 text-xs font-semibold mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Developer
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Venkat Shyam.N</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">Digital Marketer &bull; UI/UX Designer &bull; Graphic &amp; Web Designer &bull; Artist &bull; AI Tools Expert</p>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  Hyderabad, Telangana, India
                </div>
                <a href="mailto:vsnagoju@gmail.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-600 transition-colors group">
                  <span className="w-9 h-9 rounded-lg bg-coral-50 border border-coral-100 flex items-center justify-center flex-shrink-0 group-hover:bg-coral-100 transition-colors">
                    <svg className="w-4 h-4 text-coral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span className="group-hover:font-medium transition-all">vsnagoju@gmail.com</span>
                </a>
                <a href="tel:+919949994082" className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-600 transition-colors group">
                  <span className="w-9 h-9 rounded-lg bg-warm-50 border border-warm-100 flex items-center justify-center flex-shrink-0 group-hover:bg-warm-100 transition-colors">
                    <svg className="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <span className="group-hover:font-medium transition-all">+91 9949994082</span>
                </a>
                <a href="https://venkatshyamn.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-600 transition-colors group">
                  <span className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </span>
                  <span className="group-hover:font-medium transition-all">venkatshyamn.com</span>
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="glass-card-hover rounded-2xl p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-warm-50 to-coral-50 border border-warm-100/60 text-warm-700 text-xs font-semibold mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-warm-500" />
                Connect
              </div>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">Follow me on social media or reach out directly for collaborations, freelance projects, or AI solutions.</p>
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <a href="https://www.linkedin.com/in/venkatshyamn/" target="_blank" rel="noopener noreferrer" className="social-icon group">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-brand-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/VenkatShyamN" target="_blank" rel="noopener noreferrer" className="social-icon group">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-coral-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="https://venkatshyamn.com/" target="_blank" rel="noopener noreferrer" className="social-icon group">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-brand-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </a>
              </div>
              <a href="https://wa.me/919949994082?text=Hi%20Venkat%20Shyam.N%2C%20I%20visited%20your%20BG%20Remover%20tool%20and%20I'm%20interested%20in%20your%20services" target="_blank" rel="noopener noreferrer" className="btn-glow w-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Talk With Designer
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight gradient-text">BG Remover</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto md:mx-0">
                AI-powered instant background removal &mdash; free, private, and professional quality.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-5">
                <a href="/privacy-policy" className="text-xs text-gray-400 hover:text-brand-600 transition-colors">Privacy</a>
                <span className="text-gray-200">|</span>
                <a href="/terms" className="text-xs text-gray-400 hover:text-brand-600 transition-colors">Terms</a>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Services</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li>Background Removal</li>
                <li>Web Design &amp; Development</li>
                <li>UI/UX Design</li>
                <li>Graphic Design</li>
                <li>AI Solutions</li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li>Hyderabad, Telangana, India</li>
                <li><a href="tel:+919949994082" className="hover:text-brand-600 transition-colors">+91 9949994082</a></li>
                <li><a href="mailto:vsnagoju@gmail.com" className="hover:text-brand-600 transition-colors">vsnagoju@gmail.com</a></li>
                <li><a href="https://venkatshyamn.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">venkatshyamn.com</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 text-center sm:text-left">
              &copy; {new Date().getFullYear()} BG Remover &mdash; Designed &amp; Developed by{" "}
              <a href="https://venkatshyamn.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">Venkat Shyam.N</a>
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.linkedin.com/in/venkatshyamn/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.instagram.com/VenkatShyamN" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-coral-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://venkatshyamn.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <div className="whatsapp-float group">
        <div className="whatsapp-tag group-hover:opacity-100 group-hover:translate-x-0">
          <span className="text-brand-600 font-semibold">Talk With Designer</span>
        </div>
        <a
          href="https://wa.me/919949994082?text=Hi%20Venkat%20Shyam.N%2C%20I%20visited%20your%20BG%20Remover%20tool%20and%20I'm%20interested%20in%20your%20services"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>

      {!originalUrl && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-2xl border-t border-gray-100/80 md:hidden z-40 shadow-2xl">
          <button onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/jpeg,image/png,image/webp"; input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleImageSelected(file); }; input.click(); }} className="btn-glow w-full py-3.5 text-sm">Upload Image &mdash; Remove Background</button>
        </motion.div>
      )}
    </main>
  );
}
