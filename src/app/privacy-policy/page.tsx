import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Instant Background Remover",
  description: "Privacy policy for Instant Background Remover. We do not store your images or personal data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p>
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">1. Introduction</h2>
          <p>
            BG Remover (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we handle your information when you use our background removal service.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">2. Data We Collect</h2>
          <p>
            We do <strong>not</strong> collect, store, or share any personal information. Images you upload
            are processed in real-time and are immediately deleted after processing.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">3. How We Process Images</h2>
          <p>
            When you upload an image, it is sent directly to the Remove.bg API for background removal.
            The processed result is returned to you, and the original image is deleted from our servers
            immediately. We do not cache, store, or analyze your images.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">4. Third-Party Services</h2>
          <p>
            We use Remove.bg API to process background removal. Please refer to
            <a href="https://www.remove.bg/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
              {" "}Remove.bg&apos;s Privacy Policy
            </a> for information on how they handle data.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">5. Cookies</h2>
          <p>
            We do not use cookies or any tracking technologies.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">6. Contact</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at
            privacy@bgremover.app.
          </p>
        </div>
      </div>
    </main>
  );
}
