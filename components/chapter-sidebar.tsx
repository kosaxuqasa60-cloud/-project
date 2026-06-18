"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronRight, ChevronsUpDown, ListTree, Tags } from "lucide-react"
import { cn } from "@/lib/utils"

type Node = {
  id: string
  title: string
  count?: number
  children?: { id: string; title: string; count?: number }[]
}

const chapterTree: Node[] = [
  { id: "c13", title: "第13章 相交线与平行线", count: 48 },
  { id: "c14", title: "第14章 实数", count: 36 },
  {
    id: "c15",
    title: "第15章 一元一次不等式",
    children: [
      { id: "c15-1", title: "15.1 不等式", count: 22 },
      { id: "c15-2", title: "15.2 一元一次不等式组", count: 31 },
      { id: "c15-3", title: "15.3 一元一次不等式的应用", count: 18 },
    ],
  },
  { id: "c16", title: "第16章 平面直角坐标系", count: 40 },
  { id: "zh", title: "综合与实践", count: 12 },
]

const knowledgeTree: Node[] = [
  {
    id: "k1",
    title: "数与代数",
    children: [
      { id: "k1-1", title: "不等式的性质", count: 26 },
      { id: "k1-2", title: "一元一次不等式解法", count: 33 },
      { id: "k1-3", title: "不等式组与公共解集", count: 31 },
      { id: "k1-4", title: "数轴表示", count: 19 },
    ],
  },
  {
    id: "k2",
    title: "图形与几何",
    children: [
      { id: "k2-1", title: "相交线与平行线", count: 48 },
      { id: "k2-2", title: "平面直角坐标系", count: 40 },
    ],
  },
  {
    id: "k3",
    title: "综合与实践",
    children: [{ id: "k3-1", title: "实际问题建模", count: 14 }],
  },
]

export function ChapterSidebar({
  onSwitchTextbook,
}: {
  onSwitchTextbook?: () => void
}) {
  const [mode, setMode] = useState<"chapter" | "knowledge">("chapter")
  const [expanded, setExpanded] = useState<string[]>(["c15", "k1"])
  const [active, setActive] = useState("c15-2")

  const tree = mode === "chapter" ? chapterTree : knowledgeTree

  const toggle = (id: string) =>
    setExpanded((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <div className="flex h-full flex-col">
      {/* 教材封面切换卡 */}
      <button
        onClick={onSwitchTextbook}
        className="group mb-3 flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2.5 text-left transition hover:border-brand/50 hover:shadow-sm"
      >
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-border">
          <Image
            src="/textbook-math-7b.png"
            alt="数学 七年级下册 教材封面"
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">数学 · 沪教版</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            七年级下册 · 2025学年
          </p>
          <span className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-brand">
            切换教材 / 学期
            <ChevronsUpDown className="size-3" />
          </span>
        </div>
      </button>

      {/* 章节 / 知识点 模式切换 */}
      <div className="mb-2 flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
        {(
          [
            { key: "chapter", label: "章节目录", icon: ListTree },
            { key: "knowledge", label: "知识点", icon: Tags },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[13px] font-medium transition",
              mode === m.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <m.icon className="size-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      {/* 树 */}
      <nav className="-mx-1 flex-1 overflow-y-auto px-1">
        {tree.map((node) => {
          const isOpen = expanded.includes(node.id)
          const parentActive = node.id === active && !node.children
          return (
            <div key={node.id}>
              <button
                onClick={() => (node.children ? toggle(node.id) : setActive(node.id))}
                className={cn(
                  "flex w-full items-center gap-1.5 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  parentActive
                    ? "bg-brand-soft font-medium text-brand-soft-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {node.children ? (
                  <ChevronRight
                    className={cn(
                      "size-3.5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-90",
                    )}
                  />
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}
                <span className="truncate">{node.title}</span>
                {node.count != null && (
                  <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {node.count}
                  </span>
                )}
              </button>
              {node.children && isOpen && (
                <div className="ml-3 border-l border-border pl-1.5">
                  {node.children.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActive(sub.id)}
                      className={cn(
                        "flex w-full items-center gap-1.5 rounded-md px-2 py-2 text-left text-[13px] transition-colors",
                        sub.id === active
                          ? "bg-brand-soft font-medium text-brand-soft-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <span className="truncate">{sub.title}</span>
                      {sub.count != null && (
                        <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
                          {sub.count}
                        </span>
                      )}
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
