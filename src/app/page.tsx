import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <header className="w-full top-0 sticky z-50 bg-surface-container-lowest border-b border-outline-variant">
        <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MeetSense Logo"
              className="h-8 object-contain"
            />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              className="text-primary font-bold border-b-2 border-primary transition-opacity hover:opacity-80"
              href="#"
            >
              Home
            </a>
            <a
              className="text-secondary font-button hover:text-primary transition-colors"
              href="#"
            >
              Features
            </a>
            <a
              className="text-secondary font-button hover:text-primary transition-colors"
              href="#"
            >
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:block text-primary font-button hover:underline transition-all"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-button inline-flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>
      <main>
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-32 md:pb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-surface-container-high opacity-40 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-secondary-fixed opacity-30 blur-[120px] rounded-full"></div>
          </div>
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-1.5 rounded-full mb-8 shadow-sm animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-status-success animate-pulse"></span>
              <span className="text-label-md font-label-md text-secondary">
                New: AI Summarization v2.0
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-on-surface mb-6 max-w-4xl mx-auto leading-[1.1]">
              Turn every meeting into{" "}
              <span className="text-primary italic">action</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-body-md">
              Stop losing key insights in the noise. MeetSense uses
              enterprise-grade AI to transcribe, summarize, and sync your tasks
              instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-lg text-center hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center"
              >
                Try it free
              </Link>
              <button className="w-full sm:w-auto bg-surface-container-lowest text-on-surface border border-outline-variant px-8 py-4 rounded-xl font-button text-lg hover:bg-surface-container transition-all">
                Book a demo
              </button>
            </div>

            <div className="mt-20 relative mx-auto max-w-5xl group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[24px] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl overflow-hidden aspect-[16/9]">
                <img
                  alt="Enterprise SaaS Dashboard"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgcNGTLNSDIsGeJjccScx3c-09mfi6zbGwkRzCob4V237Qb5Vn6zS4SbSlGNEQWPINFd-LuPL2XSk949MZSvVVEeasbcgtvpXcjmsE2BvuVdip8LHMpZoz_Ol5Qj6NIpW4tD9r6H1D-3BJobwUHdMDAgEJrrpmyLv6OGWsYHFYGVkRM0UzTwM0Ze-Zhc88uzSMNz_w-tUaR3wc4-lL_CVZh6sBGgovN04Ej9e7Mbqi9PiXC40_Cu_pX0OG3DeGLfySysPjehmII6I"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="text-headline-lg font-headline-lg text-on-surface mb-4">
                Focus on the conversation
              </h2>
              <p className="text-body-lg text-on-surface-variant">
                Three simple steps to a more productive workflow.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-outline-variant to-transparent -z-0"></div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6 shadow-sm border border-outline-variant">
                  <span
                    className="material-symbols-outlined text-primary text-4xl"
                    data-icon="upload_file"
                  >
                    upload_file
                  </span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface mb-3">
                  1. Upload
                </h3>
                <p className="text-body-md text-on-surface-variant max-w-[280px]">
                  Upload your video or audio recording from Zoom, Teams, or
                  Google Meet.
                </p>
              </div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6 shadow-sm border border-outline-variant">
                  <span
                    className="material-symbols-outlined text-secondary text-4xl"
                    data-icon="auto_awesome"
                  >
                    auto_awesome
                  </span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface mb-3">
                  2. AI Extracts
                </h3>
                <p className="text-body-md text-on-surface-variant max-w-[280px]">
                  Our model identifies speakers, key decisions, and creates a
                  concise summary.
                </p>
              </div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6 shadow-sm border border-outline-variant">
                  <span
                    className="material-symbols-outlined text-primary text-4xl"
                    data-icon="task_alt"
                  >
                    task_alt
                  </span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface mb-3">
                  3. Track Items
                </h3>
                <p className="text-body-md text-on-surface-variant max-w-[280px]">
                  Sync action items directly to Notion, Slack, or Jira and track
                  their progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
              <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col justify-between overflow-hidden group hover:border-primary/30 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="bg-surface-container text-primary p-2 rounded-lg material-symbols-outlined"
                      data-icon="hub"
                    >
                      hub
                    </span>
                    <span className="font-bold text-on-surface">
                      Integrated Ecosystem
                    </span>
                  </div>
                  <h3 className="text-headline-md font-headline-md mb-4 leading-tight">
                    Live workflow sync with your favorite tools.
                  </h3>
                  <p className="text-on-surface-variant">
                    Don't change how you work. MeetSense pushes updates to where
                    your team already lives.
                  </p>
                </div>
                <div className="mt-8 transform group-hover:scale-105 transition-transform duration-500">
                  <img
                    alt="Software Logos Grid"
                    className="w-full h-auto rounded-lg grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeBPMPLM_AZiUk92A-Y-sfqLuu_KLLcDOgn2xQRuleM3n8fkQfml1ws5FqheZ7wBGKn7jjRnwD5JVlj2ArQ78BP_tSNCEBNJSsnHlhJHM2g47oC7g7e3COaAw2db0ioqaP9HrC0_NMXiwV4JSTAi-rP7wbZoiNkuLdh3onq7lex2Tnzw-Rr56Z_JRYH0gNmrHRV9Uh8DWNk0XzEiC4WQ3aM7uQqYlmVAmu6G7-542X6UKZ5IfEkbpqiWt5n-faNATiIUZGLaIWjVk"
                  />
                </div>
              </div>

              <div className="md:col-span-2 bg-surface-container-low border border-outline-variant rounded-xl p-8 flex items-center gap-6 group hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h4 className="text-headline-sm font-headline-sm mb-2">
                    Speaker ID
                  </h4>
                  <p className="text-body-sm text-on-surface-variant">
                    Never wonder who said what. Accurate multi-speaker
                    identification.
                  </p>
                </div>
                <div className="w-24 h-24 flex-shrink-0 bg-surface-container-lowest rounded-full border border-outline-variant overflow-hidden relative">
                  <img
                    alt="Speaker Profile"
                    className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCISt_x1WcRLuEUqKvSO1-nxOTwsZiKe4H9HKK-XOIN1eT1zmOOCFyBfNdFrh57rKpI1MjDvklxveUy6RJpUtc-vscIVY9JPWC-AUhP8lJ-QpAa3c25NFoN_lQTqASSSIfUaPMYTaQNroW26ZmzOY1oAHDXd8vwG-U3m7H64cDHkeXnDP6XFP_1QUi6zVGoP7j2Mv_EP54qdoYEpW8tSGfpxCm82zFL1GDLChPpKTzmUJk38PZI3oJbNkDSTfRJg1Lep4mz9vMb77E"
                  />
                </div>
              </div>

              <div className="md:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col justify-between hover:border-primary/30 transition-all">
                <span
                  className="material-symbols-outlined text-primary text-3xl mb-4"
                  data-icon="security"
                >
                  security
                </span>
                <div>
                  <h4 className="font-bold mb-1">SOC-2 Secure</h4>
                  <p className="text-label-md text-on-surface-variant">
                    Your data is encrypted and private by default.
                  </p>
                </div>
              </div>

              <div className="md:col-span-1 bg-primary text-on-primary rounded-xl p-8 flex flex-col justify-between group cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span
                  className="material-symbols-outlined text-3xl mb-4"
                  data-icon="rocket_launch"
                >
                  rocket_launch
                </span>
                <div>
                  <h4 className="font-bold mb-1">Scale Fast</h4>
                  <p className="text-label-md text-on-primary/80">
                    Enterprise-ready for teams of all sizes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="bg-primary-container rounded-[32px] p-12 md:p-24 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-on-primary-container mb-6">
                  Ready to make meetings matter?
                </h2>
                <p className="text-body-lg text-on-primary-container/80 mb-10 max-w-xl mx-auto">
                  Join over 10,000 teams using MeetSense to eliminate follow-up
                  friction.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    href="/login"
                    className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold text-center flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/10"
                  >
                    Get Started for Free
                  </Link>
                  <button className="border border-on-primary-container/30 text-on-primary-container px-8 py-4 rounded-xl font-bold hover:bg-on-primary-container/10 transition-all">
                    Talk to Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bottom-0 bg-surface-container border-t border-outline-variant">
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
            <a
              className="text-on-surface-variant font-button hover:underline hover:text-primary transition-all"
              href="#"
            >
              Product
            </a>
            <a
              className="text-on-surface-variant font-button hover:underline hover:text-primary transition-all"
              href="#"
            >
              Solutions
            </a>
            <a
              className="text-on-surface-variant font-button hover:underline hover:text-primary transition-all"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-on-surface-variant font-button hover:underline hover:text-primary transition-all"
              href="#"
            >
              Terms
            </a>
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
    </>
  );
}
