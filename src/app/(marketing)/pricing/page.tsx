import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-20">
        <h1 className="text-display font-display text-on-surface mb-6">
          Simple, Transparent Pricing
        </h1>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 shadow-sm max-w-md w-full mx-auto">
          <h2 className="text-headline-md font-bold text-primary mb-4">
            Currently Free
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-8">
            MeetSense is currently in open beta and completely free to use.
            Premium features and paid tiers will be introduced later.
          </p>
          <Link
            href="/login"
            className="inline-block w-full bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Get Started for Free
          </Link>
        </div>
      </main>
    </div>
  );
}
