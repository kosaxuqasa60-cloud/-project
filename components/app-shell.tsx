"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BookOpen,
  Presentation,
  ClipboardList,
  RotateCcw,
  LineChart,
  Layers,
  Settings,
  Bell,
  ChevronDown,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "首页", icon: Home, href: "#" },
  { label: "备课", icon: BookOpen, href: "#" },
  { label: "教学", icon: Presentation, href: "#" },
  { label: "作业", icon: ClipboardList, href: "#" },
  { label: "错题", icon: RotateCcw, href: "#" },
  { label: "学情", icon: LineChart, href: "#" },
  { label: "资源", icon: Layers, href: "/" },
  { label: "管理", icon: Settings, href: "#" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isResourceActive = pathname === "/" || pathname.startsWith("/new-question")

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* 左侧导航 */}
      <aside className="flex w-[72px] shrink-0 flex-col items-center gap-1 bg-sidebar py-3">
        {navItems.map((item) => {
          const active = item.label === "资源" && isResourceActive
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-md py-2.5 text-[11px] transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-5" strokeWidth={1.75} />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </aside>

      {/* 右侧主体 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶栏 */}
        <header className="flex h-14 shrink-0 items-center justify-between bg-topbar px-6 text-topbar-foreground">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span>有我知了</span>
            <span className="text-topbar-foreground/80 text-base font-medium">
              教学评一体化AI空间
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <span className="font-medium">有我初中</span>
            <span className="flex items-center gap-1.5 opacity-90">
              <span className="grid size-6 place-items-center rounded-full bg-topbar-foreground/15 text-xs">
                xh
              </span>
              xh200
            </span>
            <button className="flex items-center gap-1.5 rounded-md bg-card px-3 py-1.5 text-foreground">
              数学
              <ChevronDown className="size-4 opacity-60" />
            </button>
            <Bell className="size-5 opacity-90" />
            <ShieldCheck className="size-5 opacity-90" />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
