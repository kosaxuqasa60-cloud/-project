"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Book = {
  id: string
  cover: string
  subject: string
  edition: string
  grade: string
}

const books: Book[] = [
  { id: "m7b", cover: "/textbook-math-7b.png", subject: "数学", edition: "沪教版", grade: "七年级下册" },
  { id: "m8", cover: "/textbook-math-8.png", subject: "数学", edition: "沪教版", grade: "八年级上册" },
  { id: "p8", cover: "/textbook-phys-8.png", subject: "物理", edition: "沪教版", grade: "八年级上册" },
]

const years = ["2025学年", "2024学年"]
const terms = ["下学期", "上学期"]

export function TextbookSwitcher({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [activeBook, setActiveBook] = useState("m7b")
  const [year, setYear] = useState("2025学年")
  const [term, setTerm] = useState("下学期")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="关闭"
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">切换教材</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 学年 / 学期 */}
        <div className="mb-5 flex flex-wrap gap-x-8 gap-y-3">
          <Segment label="学年" items={years} active={year} onChange={setYear} />
          <Segment label="学期" items={terms} active={term} onChange={setTerm} />
        </div>

        {/* 教材封面网格 */}
        <p className="mb-2 text-sm font-medium text-foreground">选择教材</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {books.map((b) => {
            const on = activeBook === b.id
            return (
              <button
                key={b.id}
                onClick={() => setActiveBook(b.id)}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-xl border bg-card p-2 text-left transition",
                  on ? "border-brand ring-1 ring-brand/30" : "border-border hover:border-brand/40",
                )}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg ring-1 ring-border">
                  <Image src={b.cover} alt={`${b.subject} ${b.grade}`} fill sizes="160px" className="object-cover" />
                  {on && (
                    <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-brand text-brand-foreground">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="px-1 pt-2">
                  <p className="text-sm font-semibold text-foreground">
                    {b.subject} · {b.edition}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{b.grade}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
          >
            确定切换
          </button>
        </div>
      </div>
    </div>
  )
}

function Segment({
  label,
  items,
  active,
  onChange,
}: {
  label: string
  items: string[]
  active: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
        {items.map((it) => (
          <button
            key={it}
            onClick={() => onChange(it)}
            className={cn(
              "rounded-md px-3 py-1 text-[13px] font-medium transition",
              active === it ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {it}
          </button>
        ))}
      </div>
    </div>
  )
}
