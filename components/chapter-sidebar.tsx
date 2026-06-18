"use client"

import { useState } from "react"
import { ChevronRight, BookCopy } from "lucide-react"
import { cn } from "@/lib/utils"

type Chapter = {
  id: string
  title: string
  children?: { id: string; title: string }[]
}

const chapters: Chapter[] = [
  { id: "c13", title: "第13章 相交线与平行线" },
  { id: "c14", title: "第14章 实数" },
  {
    id: "c15",
    title: "第15章 一元一次不等式",
    children: [
      { id: "c15-1", title: "15.1 不等式" },
      { id: "c15-2", title: "15.2 一元一次不等式组" },
    ],
  },
  { id: "c16", title: "第16章 平面直角坐标系" },
  { id: "zh", title: "综合与实践" },
]

export function ChapterSidebar({
  activeSection = "c15-2",
}: {
  activeSection?: string
}) {
  const [expanded, setExpanded] = useState<string[]>(["c15"])
  const [active, setActive] = useState(activeSection)

  const toggle = (id: string) =>
    setExpanded((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">章节目录</h2>
        <button className="flex items-center gap-1 rounded-md bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-soft-foreground transition hover:opacity-90">
          <BookCopy className="size-3.5" />
          切换教材
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {chapters.map((ch) => {
          const isOpen = expanded.includes(ch.id)
          const parentActive = ch.id === active && !ch.children
          return (
            <div key={ch.id}>
              <button
                onClick={() => (ch.children ? toggle(ch.id) : setActive(ch.id))}
                className={cn(
                  "flex w-full items-center gap-1.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  parentActive
                    ? "bg-brand-soft font-medium text-brand-soft-foreground"
                    : "text-foreground hover:bg-muted",
                  ch.children &&
                    isOpen &&
                    "font-medium text-brand-soft-foreground",
                )}
              >
                {ch.children ? (
                  <ChevronRight
                    className={cn(
                      "size-3.5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-90",
                    )}
                  />
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}
                <span className="truncate">{ch.title}</span>
              </button>
              {ch.children && isOpen && (
                <div className="ml-3 border-l border-border pl-2">
                  {ch.children.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActive(sub.id)}
                      className={cn(
                        "flex w-full items-center rounded-md px-2.5 py-2 text-left text-[13px] transition-colors",
                        sub.id === active
                          ? "bg-brand-soft font-medium text-brand-soft-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {sub.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
