"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCheck, IconPlus, IconSearch, IconStar, IconZap } from "@/components/Icons";

const NAV = [
  { href: "/dashboard", label: "Browse", Icon: IconSearch },
  { href: "/create-task", label: "Create", Icon: IconPlus },
  { href: "/activity", label: "Activity", Icon: IconZap },
  { href: "/profile", label: "Profile", Icon: IconStar },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08]"
      style={{ background: "rgba(11,15,20,0.96)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${active ? "text-teal-400" : "text-slate-500"}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
