import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-32 text-center mt-10 relative z-10">
        <h1 className="text-display font-display text-on-surface mb-6 font-bold gradient-text">
          Simple, Transparent Pricing
        </h1>
        <p className="text-body-xl text-on-surface-variant max-w-2xl mx-auto mb-16">
          Start deciphering your meetings today. No credit card required.
        </p>

        <div className="glass-panel border border-outline-variant/30 rounded-3xl p-12 shadow-premium max-w-lg w-full mx-auto animate-in fade-in zoom-in-95 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary opacity-80 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-8">
            <span className="material-symbols-outlined text-[48px] text-primary">rocket_launch</span>
          </div>

          <h2 className="text-[32px] font-bold text-on-surface mb-2">
            Early Access Beta
          </h2>
          <div className="text-display font-bold text-primary mb-6">
            $0 <span className="text-title-md text-on-surface-variant font-normal">/ month</span>
          </div>
          
          <p className="text-body-lg text-on-surface-variant mb-8 text-left">
            MeetSense is currently in open beta and completely free to use while we refine the product.
          </p>

          <ul className="text-left space-y-4 mb-10">
            {[
              "Unlimited AI Transcriptions",
              "Semantic Search & Ask MeetSense",
              "Unlimited Projects & Series",
              "Automated Task Extraction",
              "Standard Email Support"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-body-md text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/login"
            className="inline-block w-full bg-gradient-to-r from-primary to-secondary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
          >
            Get Started for Free
          </Link>
        </div>
      </main>
    </div>
  );
}
