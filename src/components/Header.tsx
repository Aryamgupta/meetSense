import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full top-0 sticky z-50 bg-surface-container-lowest border-b border-outline-variant">
      <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="MeetSense Logo"
            className="h-8 object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            className="text-secondary font-button hover:text-primary transition-colors hover:opacity-80"
            href="/"
          >
            Home
          </Link>
          <Link
            className="text-secondary font-button hover:text-primary transition-colors"
            href="/features"
          >
            Features
          </Link>
          <Link
            className="text-secondary font-button hover:text-primary transition-colors"
            href="/pricing"
          >
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:block text-primary font-button hover:underline transition-all"
          >
            Login
          </Link>
          <Link
            href="/login?tab=signup"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-button inline-flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
