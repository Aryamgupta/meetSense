import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container border-t border-outline-variant mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-stack-lg w-full max-w-7xl mx-auto gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MeetSense Logo"
              className="h-6 object-contain grayscale"
            />
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant text-center md:text-left">
            © 2024 MeetSense Inc. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            className="text-on-surface-variant font-button hover:underline hover:text-primary transition-all"
            href="/features"
          >
            Product
          </Link>
          <Link
            className="text-on-surface-variant font-button hover:underline hover:text-primary transition-all"
            href="/contact"
          >
            Contact Us
          </Link>
          <Link
            className="text-on-surface-variant font-button hover:underline hover:text-primary transition-all"
            href="/privacy"
          >
            Privacy
          </Link>
          <Link
            className="text-on-surface-variant font-button hover:underline hover:text-primary transition-all"
            href="/terms"
          >
            Terms
          </Link>
        </div>
        <div className="flex gap-4">
          <button className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center hover:bg-surface transition-colors active:scale-95">
            <span
              className="material-symbols-outlined text-lg"
              data-icon="alternate_email"
            >
              alternate_email
            </span>
          </button>
          <button className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center hover:bg-surface transition-colors active:scale-95">
            <span
              className="material-symbols-outlined text-lg"
              data-icon="public"
            >
              public
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
