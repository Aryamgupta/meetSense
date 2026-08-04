import Link from "next/link";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <main>
        {/* Hero Section */}
        <section className="bg-surface-container-lowest border-b border-outline-variant relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--color-secondary)_0%,_transparent_50%)]"></div>
          <div className="max-w-7xl mx-auto px-4 py-24 text-center relative z-10">
            <h1 className="text-display font-display font-bold text-on-surface mb-6 tracking-tight">
              Meetings, Deciphered.
            </h1>
            <p className="text-headline-md text-on-surface-variant max-w-3xl mx-auto mb-10">
              Transform chaotic conversations into structured intelligence.
              MeetSense uses enterprise-grade AI to give you clarity and focus.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/login"
                className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-button text-lg hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-95"
              >
                Start Free Trial
              </Link>
              <button className="border border-outline text-on-surface px-8 py-4 rounded-xl font-button text-lg hover:bg-surface-container transition-all">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel border border-outline-variant/30 rounded-3xl p-8 hover:border-primary/50 transition-all group shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[28px]">forum</span>
              </div>
              <h3 className="text-headline-md font-bold mb-3 text-on-surface">Ask MeetSense</h3>
              <p className="text-body-lg text-on-surface-variant">
                Chat directly with your past meetings. Ask questions and get instant, cited answers based on your actual conversations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel border border-outline-variant/30 rounded-3xl p-8 hover:border-secondary/50 transition-all group shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[28px]">folder_managed</span>
              </div>
              <h3 className="text-headline-md font-bold mb-3 text-on-surface">Project & Series Organization</h3>
              <p className="text-body-lg text-on-surface-variant">
                Group recurring syncs and categorize meetings into Projects to keep your knowledge base perfectly organized.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel border border-outline-variant/30 rounded-3xl p-8 hover:border-primary/50 transition-all group shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[28px]">task_alt</span>
              </div>
              <h3 className="text-headline-md font-bold mb-3 text-on-surface">AI Task Deduplication</h3>
              <p className="text-body-lg text-on-surface-variant">
                Our AI automatically detects when the same action item comes up across multiple meetings, preventing duplicate tasks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel border border-outline-variant/30 rounded-3xl p-8 hover:border-secondary/50 transition-all group shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[28px]">search</span>
              </div>
              <h3 className="text-headline-md font-bold mb-3 text-on-surface">Global Semantic Search</h3>
              <p className="text-body-lg text-on-surface-variant">
                Don't remember which meeting it was in? Search by meaning, not just keywords, across your entire meeting history.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
