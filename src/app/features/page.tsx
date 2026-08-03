import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="w-full sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
        <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="MeetSense Logo" className="h-8 object-contain" />
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="text-primary font-button hover:underline transition-all">Login</Link>
            <Link href="/login" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-button hover:brightness-110 transition-all">
              Start Free Trial
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-surface-container-lowest border-b border-outline-variant relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--color-secondary)_0%,_transparent_50%)]"></div>
          <div className="max-w-7xl mx-auto px-4 py-24 text-center relative z-10">
            <h1 className="text-display font-display font-bold text-on-surface mb-6 tracking-tight">
              Meetings, Deciphered.
            </h1>
            <p className="text-headline-md text-on-surface-variant max-w-3xl mx-auto mb-10">
              Transform chaotic conversations into structured intelligence. MeetSense uses enterprise-grade AI to give you clarity and focus.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login" className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-button text-lg hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-95">
                Start Free Trial
              </Link>
              <button className="border border-outline text-on-surface px-8 py-4 rounded-xl font-button text-lg hover:bg-surface-container transition-all">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 hover:border-secondary transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[24px]">summarize</span>
              </div>
              <h3 className="text-headline-md font-bold mb-3 text-on-surface">AI Summary</h3>
              <p className="text-body-lg text-on-surface-variant">
                Visualizing complex notes turning into a concise paragraph. We extract the signal from the noise instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 hover:border-secondary transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[24px]">task_alt</span>
              </div>
              <h3 className="text-headline-md font-bold mb-3 text-on-surface">Action Item Extraction</h3>
              <p className="text-body-lg text-on-surface-variant">
                A list transforming into checked tasks with assigned owners. Never let a follow-up slip through the cracks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 hover:border-secondary transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[24px]">record_voice_over</span>
              </div>
              <h3 className="text-headline-md font-bold mb-3 text-on-surface">Real-time Transcription</h3>
              <p className="text-body-lg text-on-surface-variant">
                A live-streaming text visual with precise speaker identification and highly accurate speech-to-text.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 hover:border-secondary transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[24px]">integration_instructions</span>
              </div>
              <h3 className="text-headline-md font-bold mb-3 text-on-surface">Native Integrations</h3>
              <p className="text-body-lg text-on-surface-variant">
                Seamlessly sync insights to Notion and Slack. MeetSense acts as a central intelligence layer for your existing tools.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
