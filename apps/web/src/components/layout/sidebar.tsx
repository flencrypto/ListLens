"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Camera, ShieldCheck, Clock, CreditCard } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio/new", label: "Studio", icon: Camera },
  { href: "/guard/new", label: "Guard", icon: ShieldCheck },
  { href: "/history", label: "History", icon: Clock },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 border-r border-zinc-800 bg-zinc-950 flex flex-col py-6 px-3 gap-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith(href)
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          )}
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </aside>
  );
}
