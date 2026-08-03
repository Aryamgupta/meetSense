import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-display font-display text-on-surface mb-8">
          Privacy Policy
        </h1>
        <div className="prose prose-slate prose-invert max-w-none text-on-surface-variant">
          <p className="mb-4">Last updated: August 2026</p>
          <p className="mb-6">
            At MeetSense, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit our website and use our application.
          </p>

          <h2 className="text-headline-md font-bold text-on-surface mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p className="mb-4">
            We may collect personal information that you provide to us,
            including but not limited to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Name and Contact Data</li>
            <li>Authentication Data (Passwords, Passkeys)</li>
            <li>Meeting Audio and Transcripts</li>
          </ul>

          <h2 className="text-headline-md font-bold text-on-surface mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Provide, operate, and maintain our application</li>
            <li>Improve, personalize, and expand our application</li>
            <li>
              Process your meeting transcripts to generate summaries and action
              items
            </li>
          </ul>

          <h2 className="text-headline-md font-bold text-on-surface mt-8 mb-4">
            3. Data Security
          </h2>
          <p className="mb-6">
            We use administrative, technical, and physical security measures to
            help protect your personal information. Your meeting data is
            encrypted in transit and at rest.
          </p>
        </div>
      </main>
    </div>
  );
}
