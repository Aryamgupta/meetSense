import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background-page text-on-surface">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-[120px] leading-none font-headline-lg font-bold text-primary opacity-20 mb-4">
          404
        </h1>
        <h2 className="text-headline-md font-headline-md font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <Link
          href="/"
          className="bg-primary text-on-primary px-8 py-3 rounded-lg font-button inline-flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm"
        >
          Return Home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
