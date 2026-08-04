"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-background-page text-on-surface">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl">warning</span>
        </div>
        <h1 className="text-headline-md font-headline-md font-bold mb-4">
          Something went wrong!
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
          We encountered an unexpected error while trying to process your request.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="bg-primary text-on-primary px-8 py-3 rounded-lg font-button inline-flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-surface-container border border-outline-variant text-on-surface px-8 py-3 rounded-lg font-button inline-flex items-center justify-center hover:bg-surface-container-high active:scale-95 transition-all shadow-sm"
          >
            Go Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
