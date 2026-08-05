export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-4xl mx-auto px-4 py-32 w-full mt-10">
        <h1 className="text-display font-display text-on-surface mb-8 font-bold">Privacy Policy</h1>
        
        <div className="glass-panel p-10 rounded-3xl border border-outline-variant/30 text-body-lg text-on-surface-variant space-y-6">
          <p>Last updated: August 5, 2026</p>
          
          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create or modify your account, upload meeting transcripts, or communicate with us. This includes your name, email address, profile picture, and the content of the meetings you upload.
          </p>

          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">2. How We Use Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services (MeetSense). We use advanced AI models to process your meeting data to generate summaries, action items, and enable semantic search capabilities.
          </p>

          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">3. Data Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Your meeting data is secured using enterprise-grade encryption and Row Level Security protocols.
          </p>

          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">4. Sharing of Information</h2>
          <p>
            We do not share your personal information or meeting data with third parties except as necessary to provide our services (e.g., using secure LLM providers for processing), or when required by law.
          </p>

          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@meetsense.com.
          </p>
        </div>
      </main>
    </div>
  );
}
