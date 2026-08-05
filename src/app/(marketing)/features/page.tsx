import Link from "next/link";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <main className="flex-1 flex flex-col items-center px-4 py-32 mt-10 relative z-10 max-w-7xl mx-auto w-full">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h1 className="text-display font-display text-on-surface mb-6 font-bold gradient-text">
            Everything you need to master your meetings
          </h1>
          <p className="text-body-xl text-on-surface-variant">
            MeetSense transforms raw audio into a structured, searchable knowledge base.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-20">
          
          <div className="glass-panel p-10 rounded-3xl border border-primary/20 hover:shadow-premium transition-all">
            <span className="material-symbols-outlined text-[40px] text-primary mb-6">auto_awesome</span>
            <h3 className="text-headline-sm font-bold text-on-surface mb-4">AI Extraction</h3>
            <p className="text-body-lg text-on-surface-variant">
              Upload your meeting recordings and let our enterprise-grade AI automatically transcribe, summarize, and extract actionable items and decisions.
            </p>
          </div>

          <div className="glass-panel p-10 rounded-3xl border border-secondary/20 hover:shadow-premium transition-all">
            <span className="material-symbols-outlined text-[40px] text-secondary mb-6">search</span>
            <h3 className="text-headline-sm font-bold text-on-surface mb-4">Semantic Search</h3>
            <p className="text-body-lg text-on-surface-variant">
              Don't just search for keywords. Ask questions in plain English and our semantic search will find the exact moment a topic was discussed.
            </p>
          </div>

          <div className="glass-panel p-10 rounded-3xl border border-secondary/20 hover:shadow-premium transition-all">
            <span className="material-symbols-outlined text-[40px] text-secondary mb-6">folder_managed</span>
            <h3 className="text-headline-sm font-bold text-on-surface mb-4">Projects & Series</h3>
            <p className="text-body-lg text-on-surface-variant">
              Organize your workspace effectively. Group one-off meetings into Projects, and connect recurring syncs into chronological Series.
            </p>
          </div>

          <div className="glass-panel p-10 rounded-3xl border border-primary/20 hover:shadow-premium transition-all">
            <span className="material-symbols-outlined text-[40px] text-primary mb-6">notifications_active</span>
            <h3 className="text-headline-sm font-bold text-on-surface mb-4">Task Tracking</h3>
            <p className="text-body-lg text-on-surface-variant">
              Never miss a deadline. MeetSense tracks overdue action items across all your meetings and sends you automated reminders via email.
            </p>
          </div>

        </div>

        <div className="text-center bg-surface-container-low border border-outline-variant/30 rounded-3xl p-16 w-full">
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Ready to get started?</h2>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-primary to-secondary text-on-primary px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
          >
            Create your free account
          </Link>
        </div>

      </main>
    </div>
  );
}
