"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type TabId = "account" | "notifications" | "security" | "data" | "support";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs: { id: TabId; label: string; icon: string; href: string }[] = [
    { id: "account", label: "Account Preferences", icon: "person", href: "/dashboard/settings/account" },
    { id: "notifications", label: "Notifications", icon: "notifications", href: "/dashboard/settings/notifications" },
    { id: "security", label: "Privacy & Security", icon: "lock", href: "/dashboard/settings/security" },
    { id: "data", label: "Data Management", icon: "database", href: "/dashboard/settings/data" },
    { id: "support", label: "Help & Support", icon: "help", href: "/dashboard/settings/support" },
  ];

  return (
    <div className="bg-transparent text-on-surface h-full w-full">
      <div className="px-4 py-8 md:px-margin-desktop mb-8">
        <h1 className="text-display font-display font-bold gradient-text">Settings</h1>
        <p className="text-body-lg text-on-surface-variant mt-2">Manage your account preferences and application settings.</p>
      </div>

      <div className="px-4 md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-8 pb-20">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 lg:col-span-3">
          <div className="glass-panel p-2 rounded-2xl flex flex-row overflow-x-auto md:flex-col md:overflow-visible gap-1 sticky top-8 z-10">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal font-bold text-left ${
                    isActive
                      ? "bg-primary text-on-primary shadow-md" 
                      : "text-on-surface hover:bg-white/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 lg:col-span-9 glass-panel rounded-3xl p-6 md:p-10 border border-outline-variant/30 relative">
          {children}
        </div>
      </div>
    </div>
  );
}
