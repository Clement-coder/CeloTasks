"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconPlus, IconSearch, IconStar, IconZap, IconShield } from "@/components/Icons";
import { useTaskStore } from "@/lib/taskStore";

const LEFT = [
  { href: "/", label: "Home", Icon: IconHome },
  { href: "/dashboard", label: "Browse", Icon: IconSearch },
];
const RIGHT = [
  { href: "/activity", label: "Activity", Icon: IconZap },
  { href: "/profile", label: "Profile", Icon: IconStar },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { reviewQueue, paymentQueue, profile } = useTaskStore();
  const isAdmin = profile?.role === "admin";
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  // Don't show on the marketing landing page
  if (pathname === "/") return null;

  const urgentCount = reviewQueue.length + paymentQueue.length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08]"
      style={{ background: "rgba(11,15,20,0.96)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
      <div className="flex items-center justify-around h-16" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {LEFT.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${isActive(href) ? "text-teal-400" : "text-slate-500"}`}>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {href === "/dashboard" && urgentCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {urgentCount > 9 ? "9+" : urgentCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        {/* Centre FAB */}
        <div className="flex flex-col items-center -mt-6">
          <Link href="/create-task"
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg, #14b8a6, #22c55e, #eab308)", boxShadow: "0 0 24px rgba(20,184,166,0.45), 0 4px 16px rgba(0,0,0,0.4)" }}>
            <IconPlus className="w-7 h-7 text-white" />
          </Link>
          <span className={`text-[10px] font-semibold mt-1 ${isActive("/create-task") ? "text-teal-400" : "text-slate-400"}`}>Create</span>
        </div>

        {RIGHT.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${isActive(href) ? "text-teal-400" : "text-slate-500"}`}>
            <div className="relative">
              <Icon className="w-5 h-5" />
              {href === "/activity" && urgentCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {urgentCount > 9 ? "9+" : urgentCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
        {isAdmin && (
          <Link href="/admin" className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${isActive("/admin") ? "text-teal-400" : "text-slate-500"}`}>
            <IconShield className="w-5 h-5" />
            <span className="text-[10px] font-medium">Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
