import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service – Instant Background Remover",
  description: "Terms of service for Instant Background Remover. Free to use, no obligations.",
};

export default function Terms() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p>
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">1. Acceptance of Terms</h2>
          <p>
            By using BG Remover (&quot;the Service&quot;), you agree to these Terms of Service.
            If you do not agree, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">2. Service Description</h2>
          <p>
            BG Remover is a free online tool that uses AI to remove backgrounds from images.
            The Service is provided &quot;as is&quot; without any warranty.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Upload illegal, offensive, or infringing content</li>
            <li>Attempt to abuse, overload, or disrupt the Service</li>
            <li>Use the Service for any unlawful purpose</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">4. Intellectual Property</h2>
          <p>
            You retain all rights to your images. We do not claim any ownership over
            uploaded or processed images.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">5. Limitation of Liability</h2>
          <p>
            BG Remover is provided free of charge. We are not liable for any damages
            arising from your use of the Service.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-8">6. Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Continued use of
            the Service after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </main>
  );
}
