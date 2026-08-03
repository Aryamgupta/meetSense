import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-display font-display text-on-surface mb-8">
          Terms of Service
        </h1>
        <div className="prose prose-slate prose-invert max-w-none text-on-surface-variant">
          <p className="mb-4">Last updated: August 2026</p>
          <p className="mb-6">
            These Terms of Service constitute a legally binding agreement made
            between you and MeetSense concerning your access to and use of the
            application.
          </p>

          <h2 className="text-headline-md font-bold text-on-surface mt-8 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="mb-6">
            By accessing or using our service, you agree to be bound by these
            Terms. If you disagree with any part of the terms, then you may not
            access the service.
          </p>

          <h2 className="text-headline-md font-bold text-on-surface mt-8 mb-4">
            2. User Accounts
          </h2>
          <p className="mb-6">
            When you create an account with us, you must provide us information
            that is accurate, complete, and current at all times. Failure to do
            so constitutes a breach of the Terms, which may result in immediate
            termination of your account on our service.
          </p>

          <h2 className="text-headline-md font-bold text-on-surface mt-8 mb-4">
            3. Prohibited Uses
          </h2>
          <p className="mb-4">
            You may use the service only for lawful purposes and in accordance
            with Terms. You agree not to use the service:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>
              In any way that violates any applicable national or international
              law or regulation.
            </li>
            <li>
              To upload or transmit viruses or any other type of malicious code.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
