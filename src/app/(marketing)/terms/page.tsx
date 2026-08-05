export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-4xl mx-auto px-4 py-32 w-full mt-10">
        <h1 className="text-display font-display text-on-surface mb-8 font-bold">Terms of Service</h1>
        
        <div className="glass-panel p-10 rounded-3xl border border-outline-variant/30 text-body-lg text-on-surface-variant space-y-6">
          <p>Last updated: August 5, 2026</p>
          
          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using MeetSense, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">2. Description of Service</h2>
          <p>
            MeetSense provides AI-powered meeting transcription, summarization, and semantic search services. The service is provided "as is" and is currently in a beta testing phase.
          </p>

          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">3. User Responsibilities</h2>
          <p>
            You are responsible for safeguarding the password that you use to access the service. You agree not to disclose your password to any third party. You are responsible for any activity using your account.
          </p>

          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">4. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of MeetSense and its licensors. You retain all rights to the meeting data and transcripts you upload to the service.
          </p>

          <h2 className="text-title-lg font-bold text-on-surface mt-8 mb-4">5. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>
      </main>
    </div>
  );
}
