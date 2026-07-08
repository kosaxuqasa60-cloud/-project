"use client"

import { useMemo, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronDown,
  Save,
  Printer,
  Download,
  Send,
  Square,
  SquareDashed,
  StickyNote,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ListTree,
  Rows3,
  Settings2,
  X,
  Sparkles,
  Minus,
  Plus,
  Maximize2,
  RotateCw,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SourceBadge } from "@/components/source-badge"
import type { Question, QType } from "@/components/resource-workbench"

const CN_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]

const diffStyle: Record<string, string> = {
  易: "text-easy bg-easy/10",
  中: "text-medium bg-medium/15",
  难: "text-hard bg-hard/10",
}

/* 每题在卷面占的“版面高度单位”，用于自动分页 */
const UNIT: Record<QType, number> = {
  单选: 22,
  多选: 26,
  判断: 15,
  填空: 24,
  主观: 50,
}

/* 纸张（卷码纸）规格 */
type PaperSize = "A4" | "B3"
const PAPER: Record<PaperSize, { label: string; ratio: string; cap: number; mm: string }> = {
  A4: { label: "A4 卷码纸", ratio: "210 / 297", cap: 108, mm: "210 × 297mm" },
  B3: { label: "B3 卷码纸", ratio: "353 / 500", cap: 190, mm: "353 × 500mm" },
}

export type LaidSection = { id: string; title: string; items: { q: Question; score: number }[] }

type BoxState = Record<string, { q: boolean; a: boolean }>
type Tool = "题目框" | "小题框" | "作答框"
/* 手动拖拽绘制的自定义框，坐标为占卷面的比例 0~1 */
type CustomBox = { id: string; page: number; tool: Tool; x: number; y: number; w: number; h: number }

const TOOL_STYLE: Record<Tool, { ring: string; tag: string; fill: string }> = {
  题目框: { ring: "outline-sky-500", tag: "bg-sky-500", fill: "bg-sky-400/10" },
  小题框: { ring: "outline-medium", tag: "bg-medium", fill: "bg-medium/10" },
  作答框: { ring: "outline-[oklch(0.58_0.1_158)]", tag: "bg-[oklch(0.58_0.1_158)]", fill: "bg-brand/10" },
}

export function DotPenLayout({
  name,
  sections,
  paper,
  onBack,
}: {
  name: string
  sections: LaidSection[]
  paper: PaperSize
  onBack: () => void
}) {
  const [showAll, setShowAll] = useState(true)
  const [tool, setTool] = useState<Tool | null>(null)
  const [tab, setTab] = useState<"byQ" | "byLevel">("byQ")
  const [selected, setSelected] = useState<string | null>(null)
  const [configFor, setConfigFor] = useState<string | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [batchOpen, setBatchOpen] = useState(false)
  const [curPage, setCurPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [rotate, setRotate] = useState(0)
  const [customBoxes, setCustomBoxes] = useState<CustomBox[]>([])

  const addCustomBox = (page: number, t: Tool, r: { x: number; y: number; w: number; h: number }) =>
    setCustomBoxes((prev) => [...prev, { id: `cb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, page, tool: t, ...r }])
  const removeCustomBox = (id: string) => setCustomBoxes((prev) => prev.filter((b) => b.id !== id))

  /* 展开题目序列 */
  const flat = useMemo(() => {
    const arr: { q: Question; score: number; secIdx: number; secTitle: string; gi: number }[] = []
    let gi = 0
    sections.forEach((s, si) =>
      s.items.forEach(({ q, score }) => {
        gi += 1
        arr.push({ q, score, secIdx: si, secTitle: s.title, gi })
      }),
    )
    return arr
  }, [sections])

  /* 框选状态：AI 默认全框，首题留答案框待确认演示 */
  const [boxes, setBoxes] = useState<BoxState>(() => {
    const b: BoxState = {}
    flat.forEach((f, i) => (b[f.q.id] = { q: true, a: i !== 0 }))
    return b
  })

  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(flat.map((f) => [f.q.id, f.score])),
  )

  const capacity = PAPER[paper].cap
  /* 自动分页 */
  const pages = useMemo(() => {
    const result: typeof flat[] = []
    let cur: typeof flat = []
    let used = 0
    flat.forEach((f) => {
      const h = UNIT[f.q.qType]
      if (used + h > capacity && cur.length) {
        result.push(cur)
        cur = []
        used = 0
      }
      cur.push(f)
      used += h
    })
    if (cur.length) result.push(cur)
    return result
  }, [flat, capacity])

  const statusOf = (id: string): "done" | "warn" | "none" => {
    const b = boxes[id]
    if (b?.q && b?.a) return "done"
    if (b?.q || b?.a) return "warn"
    return "none"
  }

  /* 右栏/卷面用的确认状态 */
  const noteOf = (f: { q: Question }): { label: string; tone: "green" | "orange" | "red" } => {
    const st = statusOf(f.q.id)
    if (st === "none") return { label: "未框选", tone: "red" }
    if (st === "warn") return { label: "待确认", tone: "orange" }
    if (f.q.qType === "填空") return { label: "作答区偏小", tone: "orange" }
    return { label: "正常", tone: "green" }
  }

  const pendingCount = flat.filter((f) => noteOf(f).tone !== "green").length

  const aiFrame = () => {
    setBoxes(() => {
      const b: BoxState = {}
      flat.forEach((f) => (b[f.q.id] = { q: true, a: true }))
      return b
    })
  }

  const toggleBox = (id: string, kind: "q" | "a") => {
    setBoxes((prev) => ({ ...prev, [id]: { ...prev[id], [kind]: !prev[id]?.[kind] } }))
  }

  const clampPage = (p: number) => Math.max(1, Math.min(pages.length, p))
  const pageItems = pages[clampPage(curPage) - 1] ?? []

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 顶部工具条 */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <button
          onClick={onBack}
          className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="返回"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-base font-bold text-foreground">确认题目与作答区</h1>

        {/* 卷名下拉（示意） */}
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition hover:bg-muted">
          <span className="max-w-[220px] truncate">{name}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>

        {/* 纸张 */}
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="size-3 rounded-sm bg-[radial-gradient(oklch(0.6_0.02_250)_0.5px,transparent_0.5px)] [background-size:3px_3px] ring-1 ring-border" />
          {paper} {PAPER[paper].mm}
        </span>

        {/* 识别状态 */}
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span className={cn("size-2 rounded-full", pendingCount ? "bg-warn" : "bg-easy")} />
          <span className="text-muted-foreground">
            已识别 <span className="font-semibold text-foreground">{flat.length}</span> 题，
          </span>
          {pendingCount > 0 && (
            <span className="font-semibold text-warn-foreground">{pendingCount} 处待确认</span>
          )}
        </span>

        {/* 右侧操作 */}
        <div className="ml-auto flex items-center gap-2">
          <HeaderBtn icon={Save}>保存</HeaderBtn>
          <HeaderBtn icon={Printer}>预览打印</HeaderBtn>
          <HeaderBtn icon={Download}>下载PDF</HeaderBtn>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90">
            <Send className="size-4" />
            发布作业
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 左栏：智能框选 + 手动框选 */}
        <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-card p-4 lg:flex">
          <h3 className="mb-2 text-xs font-bold text-foreground">智能框选</h3>
          <button
            onClick={aiFrame}
            className="mb-3 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-brand bg-brand-soft/40 py-3 text-sm font-semibold text-brand transition hover:bg-brand-soft"
          >
            <Sparkles className="size-4" />
            AI 一键框选
          </button>
          <label className="mb-5 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-foreground">
            显示全部框
            <Switch on={showAll} onChange={setShowAll} />
          </label>

          <h3 className="mb-2 text-xs font-bold text-foreground">手动框选</h3>
          <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
            选中工具后，在卷面上<span className="font-medium text-foreground">按住拖拽</span>即可绘制框；点框右上角 × 删除。
          </p>
          <div className="mb-4 flex flex-col gap-2">
            {(["题目框", "小题框", "作答框"] as Tool[]).map((t) => {
              const on = tool === t
              const Icon = t === "作答框" ? SquareDashed : t === "小题框" ? StickyNote : Square
              return (
                <button
                  key={t}
                  onClick={() => setTool(on ? null : t)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
                    on
                      ? "border-brand bg-brand-soft text-brand-soft-foreground"
                      : "border-border text-muted-foreground hover:border-brand/40",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded border",
                      on ? "border-brand" : "border-muted-foreground/40",
                    )}
                  >
                    {on && <span className="size-2 rounded-[2px] bg-brand" />}
                  </span>
                  <Icon className="size-4" />
                  {t}
                </button>
              )
            })}
          </div>

          {/* 图例 */}
          <div className="mt-auto flex flex-col gap-1.5 rounded-lg border border-border p-2.5 text-[11px] text-muted-foreground">
            <LegendRow className="border-sky-400 bg-sky-400/10" label="题目区（印刷题干）" />
            <LegendRow className="border-brand bg-brand/10" label="作答区（手写作答）" />
            <LegendRow className="border-destructive bg-destructive/10" label="未框选 / 待确认" />
          </div>
        </aside>

        {/* 中间：缩略图 + 缩放条 + 卷面 */}
        <div className="flex min-h-0 flex-1 flex-col bg-muted/40">
          {/* 缩放工具条 */}
          <div className="flex shrink-0 items-center justify-center gap-1.5 border-b border-border bg-card/70 px-4 py-1.5 backdrop-blur">
            <ToolIcon onClick={() => setCurPage((p) => clampPage(p - 1))} disabled={curPage <= 1}>
              <ChevronLeft className="size-4" />
            </ToolIcon>
            <span className="inline-flex items-center gap-1 px-1 text-sm text-foreground">
              <span className="min-w-5 rounded border border-border bg-card px-1.5 text-center font-semibold">
                {clampPage(curPage)}
              </span>
              / {pages.length}页
            </span>
            <ToolIcon
              onClick={() => setCurPage((p) => clampPage(p + 1))}
              disabled={curPage >= pages.length}
            >
              <ChevronRight className="size-4" />
            </ToolIcon>
            <span className="mx-2 h-4 w-px bg-border" />
            <ToolIcon onClick={() => setZoom((z) => Math.max(50, z - 10))}>
              <Minus className="size-4" />
            </ToolIcon>
            <span className="min-w-12 text-center text-sm font-medium text-foreground">{zoom}%</span>
            <ToolIcon onClick={() => setZoom((z) => Math.min(200, z + 10))}>
              <Plus className="size-4" />
            </ToolIcon>
            <span className="mx-2 h-4 w-px bg-border" />
            <ToolText onClick={() => setZoom(90)} icon={Maximize2}>
              适宽
            </ToolText>
            <ToolText onClick={() => setZoom(100)} icon={Square}>
              实际大小
            </ToolText>
            <ToolText onClick={() => setRotate((r) => (r + 90) % 360)} icon={RotateCw}>
              旋转
            </ToolText>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* 缩略图列 */}
            <div className="hidden w-24 shrink-0 flex-col items-center gap-3 overflow-y-auto border-r border-border bg-card/50 py-4 sm:flex">
              {pages.map((_, pi) => (
                <button
                  key={pi}
                  onClick={() => setCurPage(pi + 1)}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "w-14 rounded-sm bg-white shadow-sm ring-1 transition",
                      clampPage(curPage) === pi + 1 ? "ring-2 ring-brand" : "ring-border",
                    )}
                    style={{ aspectRatio: PAPER[paper].ratio }}
                  >
                    <span className="flex h-full flex-col gap-1 p-1.5">
                      <span className="h-1 w-2/3 rounded-full bg-muted-foreground/25" />
                      <span className="h-1 w-full rounded-full bg-muted-foreground/15" />
                      <span className="h-1 w-full rounded-full bg-muted-foreground/15" />
                      <span className="h-1 w-1/2 rounded-full bg-muted-foreground/15" />
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-[11px]",
                      clampPage(curPage) === pi + 1 ? "font-semibold text-brand" : "text-muted-foreground",
                    )}
                  >
                    {pi + 1}
                  </span>
                </button>
              ))}
            </div>

            {/* 卷面 */}
            <div className="min-h-0 flex-1 overflow-auto p-6">
              <div className="mx-auto flex max-w-3xl justify-center">
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotate}deg)`,
                    transformOrigin: "top center",
                    width: "100%",
                  }}
                >
                  <PaperSheet
                    pageIndex={clampPage(curPage)}
                    size={paper}
                    items={pageItems}
                    boxes={boxes}
                    showAll={showAll}
                    selected={selected}
                    tool={tool}
                    noteOf={noteOf}
                    customBoxes={customBoxes.filter((b) => b.page === clampPage(curPage))}
                    onDrawBox={(r) => addCustomBox(clampPage(curPage), tool!, r)}
                    onRemoveCustom={removeCustomBox}
                    onSelect={(id) => {
                      setSelected(id)
                      setTab("byQ")
                    }}
                    onToggleBox={toggleBox}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右栏：两个 Tab */}
        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-border bg-card md:flex">
          <div className="flex shrink-0 border-b border-border">
            <TabBtn active={tab === "byQ"} onClick={() => setTab("byQ")} icon={Rows3}>
              按题目查看
            </TabBtn>
            <TabBtn active={tab === "byLevel"} onClick={() => setTab("byLevel")} icon={ListTree}>
              按层级查看
            </TabBtn>
          </div>

          {tab === "byQ" ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <span className="text-sm font-semibold text-foreground">题目</span>
                <button
                  onClick={() => {
                    setChecked(new Set(flat.map((f) => f.q.id)))
                    setBatchOpen(true)
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand transition hover:opacity-80"
                >
                  批量设置
                  <Settings2 className="size-3.5" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                <div className="flex flex-col">
                  {flat.map((f) => {
                    const note = noteOf(f)
                    return (
                      <button
                        key={f.q.id}
                        onClick={() => {
                          setSelected(f.q.id)
                          setConfigFor(f.q.id)
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition",
                          selected === f.q.id ? "bg-brand-soft/50" : "hover:bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold",
                            note.tone === "green"
                              ? "bg-brand text-brand-foreground"
                              : "bg-warn text-warn-foreground",
                          )}
                        >
                          {f.gi}
                        </span>
                        <span className="flex-1 text-sm font-medium text-foreground">小题-{f.gi}</span>
                        <span className="text-xs text-muted-foreground">{qTypeFull(f.q.qType)}</span>
                        <span className="w-10 text-right text-sm font-semibold text-brand">{scores[f.q.id]}分</span>
                        <span
                          className={cn(
                            "w-16 text-right text-xs font-medium",
                            note.tone === "green"
                              ? "text-easy"
                              : note.tone === "orange"
                                ? "text-warn-foreground"
                                : "text-destructive",
                          )}
                        >
                          {note.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  已选 <span className="font-semibold text-foreground">{checked.size}</span> 题
                </span>
                <button
                  onClick={() => setBatchOpen(true)}
                  disabled={checked.size === 0}
                  className="inline-flex items-center gap-1 rounded-md bg-brand px-2.5 py-1.5 text-xs font-medium text-brand-foreground transition hover:opacity-90 disabled:opacity-40"
                >
                  <Settings2 className="size-3.5" />
                  批量设置
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <div className="flex flex-col gap-3">
                  {sections.map((sec, si) => {
                    const ids = sec.items.map((it) => it.q.id)
                    const allOn = ids.length > 0 && ids.every((id) => checked.has(id))
                    return (
                      <div key={sec.id}>
                        <label className="mb-1 flex items-center gap-2 text-[13px] font-bold text-foreground">
                          <input
                            type="checkbox"
                            checked={allOn}
                            onChange={() =>
                              setChecked((prev) => {
                                const next = new Set(prev)
                                if (allOn) ids.forEach((id) => next.delete(id))
                                else ids.forEach((id) => next.add(id))
                                return next
                              })
                            }
                            className="size-3.5 accent-[oklch(0.58_0.1_158)]"
                          />
                          {CN_NUM[si]}、{sec.title}
                          <span className="text-[11px] font-normal text-muted-foreground">
                            {ids.length} 小题
                          </span>
                        </label>
                        <div className="flex flex-col gap-1 pl-5">
                          {sec.items.map((it, i) => (
                            <label
                              key={it.q.id}
                              className="flex items-center gap-2 rounded-md px-1.5 py-1 text-xs text-foreground hover:bg-muted"
                            >
                              <input
                                type="checkbox"
                                checked={checked.has(it.q.id)}
                                onChange={() =>
                                  setChecked((prev) => {
                                    const next = new Set(prev)
                                    next.has(it.q.id) ? next.delete(it.q.id) : next.add(it.q.id)
                                    return next
                                  })
                                }
                                className="size-3.5 accent-[oklch(0.58_0.1_158)]"
                              />
                              <span className="text-muted-foreground">{i + 1}.</span>
                              <span className="line-clamp-1 flex-1">{it.q.short}</span>
                              <StatusIcon status={statusOf(it.q.id)} />
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* 题目信息配置弹窗 */}
      {configFor && (
        <QuestionConfigModal
          item={flat.find((f) => f.q.id === configFor)!}
          score={scores[configFor]}
          onClose={() => setConfigFor(null)}
          onSave={(sc) => {
            setScores((prev) => ({ ...prev, [configFor]: sc }))
            setConfigFor(null)
          }}
        />
      )}

      {/* 批量设置弹窗 */}
      {batchOpen && (
        <BatchModal
          sections={sections}
          scores={scores}
          checkedIds={checked}
          pages={pages.length}
          onClose={() => setBatchOpen(false)}
          onApply={(map) => {
            setScores((prev) => ({ ...prev, ...map }))
            setBatchOpen(false)
          }}
        />
      )}
    </div>
  )
}

function qTypeFull(t: QType) {
  return t === "单选"
    ? "单项选择题"
    : t === "多选"
      ? "多项选择题"
      : t === "填空"
        ? "填空题"
        : t === "判断"
          ? "判断题"
          : "主观题"
}

/* ---------------------------- 卷面 ---------------------------- */

function PaperSheet({
  pageIndex,
  size,
  items,
  boxes,
  showAll,
  selected,
  tool,
  noteOf,
  customBoxes,
  onDrawBox,
  onRemoveCustom,
  onSelect,
  onToggleBox,
}: {
  pageIndex: number
  size: PaperSize
  items: { q: Question; score: number; gi: number; secTitle: string; secIdx: number }[]
  boxes: BoxState
  showAll: boolean
  selected: string | null
  tool: Tool | null
  noteOf: (f: { q: Question }) => { label: string; tone: "green" | "orange" | "red" }
  customBoxes: CustomBox[]
  onDrawBox: (r: { x: number; y: number; w: number; h: number }) => void
  onRemoveCustom: (id: string) => void
  onSelect: (id: string) => void
  onToggleBox: (id: string, kind: "q" | "a") => void
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const frac = (clientX: number, clientY: number) => {
    const el = sheetRef.current
    if (!el) return { x: 0, y: 0 }
    const r = el.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!tool) return
    e.preventDefault()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    const p = frac(e.clientX, e.clientY)
    startRef.current = p
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 })
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!tool || !startRef.current) return
    const p = frac(e.clientX, e.clientY)
    const s = startRef.current
    setDraft({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) })
  }
  const onPointerUp = () => {
    if (draft && draft.w > 0.02 && draft.h > 0.01) onDrawBox(draft)
    startRef.current = null
    setDraft(null)
  }

  return (
    <div className="w-full">
      <div
        ref={sheetRef}
        className="relative rounded-sm bg-white shadow-md ring-1 ring-border"
        style={{
          aspectRatio: PAPER[size].ratio,
          backgroundImage: "radial-gradient(oklch(0.85 0.02 250 / 0.5) 0.5px, transparent 0.5px)",
          backgroundSize: "6px 6px",
        }}
      >
        <div className="absolute inset-0 overflow-hidden p-[5%]">
          {pageIndex === 1 && (
            <>
              <div className="mb-1 text-center text-base font-bold text-neutral-900">
                七年级数学周练（第5周）
              </div>
              <p className="mb-3 text-center text-[11px] text-neutral-500">时间：90分钟　满分：100分</p>
            </>
          )}
          <div className="columns-1 gap-x-4">
            {items.map((it, idx) => {
              const b = boxes[it.q.id] ?? { q: false, a: false }
              const isSel = selected === it.q.id
              const note = noteOf(it)
              const unframed = note.tone === "red"
              const showQ = b.q && showAll
              const showA = b.a && showAll
              return (
                <div
                  key={it.q.id}
                  className={cn(
                    "mb-3 break-inside-avoid rounded-sm p-1.5 transition",
                    isSel && "ring-2 ring-brand",
                    unframed && "ring-1 ring-destructive/60",
                  )}
                  onClick={() => onSelect(it.q.id)}
                >
                  {/* 章节标题（每节首题） */}
                  {(idx === 0 || items[idx - 1]?.secIdx !== it.secIdx) && (
                    <p className="mb-1 text-[12px] font-bold text-neutral-800">
                      {CN_NUM[it.secIdx]}、{it.secTitle}
                    </p>
                  )}
                  {/* 题目区 */}
                  <div
                    className={cn(
                      "relative rounded-sm p-1",
                      showQ ? "outline outline-1 outline-sky-400 bg-sky-400/5" : "",
                      tool && tool !== "作答框" && "cursor-pointer",
                    )}
                    onClick={(e) => {
                      if (tool && tool !== "作答框") {
                        e.stopPropagation()
                        onToggleBox(it.q.id, "q")
                      }
                    }}
                  >
                    {showQ && <FrameTag className="bg-sky-500" label={`题目区 ${it.gi}`} />}
                    {showQ && note.tone !== "green" && (
                      <span className="absolute right-1 top-1 rounded bg-warn px-1.5 py-0.5 text-[9px] font-medium text-warn-foreground">
                        {note.label}
                      </span>
                    )}
                    <p className="text-[13px] leading-snug text-neutral-900">
                      <span className="font-semibold">{it.gi}. </span>
                      {it.q.short}
                      <span className="ml-1 text-[10px] text-neutral-400">（{it.score}分）</span>
                    </p>
                    {it.q.options && (
                      <div className="mt-1 flex flex-wrap gap-x-6 gap-y-0.5">
                        {it.q.options.map((o) => (
                          <span key={o.key} className="text-[13px] text-neutral-700">
                            {o.key}. {o.content}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* 作答区 */}
                  <div
                    className={cn(
                      "relative mt-1 rounded-sm",
                      showA
                        ? "outline outline-1 outline-[oklch(0.58_0.1_158)] bg-brand/5"
                        : "border border-dashed border-neutral-300",
                      it.q.qType === "主观" ? "h-12" : it.q.qType === "填空" ? "h-7" : "h-6",
                      tool === "作答框" && "cursor-pointer",
                    )}
                    onClick={(e) => {
                      if (tool === "作答框") {
                        e.stopPropagation()
                        onToggleBox(it.q.id, "a")
                      }
                    }}
                  >
                    {showA && <FrameTag className="bg-[oklch(0.58_0.1_158)]" label={`作答区 ${it.gi}`} />}
                    <span className="absolute left-1 top-0.5 text-[9px] text-neutral-400">作答区</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 手动绘制的自定义框 */}
        {showAll &&
          customBoxes.map((b) => {
            const st = TOOL_STYLE[b.tool]
            return (
              <div
                key={b.id}
                className={cn("group absolute z-10 rounded-sm outline outline-2", st.ring, st.fill)}
                style={{
                  left: `${b.x * 100}%`,
                  top: `${b.y * 100}%`,
                  width: `${b.w * 100}%`,
                  height: `${b.h * 100}%`,
                }}
              >
                <span className={cn("absolute -top-2.5 left-0 rounded px-1 text-[8px] font-medium text-white", st.tag)}>
                  {b.tool}
                </span>
                <button
                  onClick={() => onRemoveCustom(b.id)}
                  className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-destructive text-[10px] text-white opacity-0 shadow transition group-hover:opacity-100"
                  aria-label="删除框"
                >
                  <X className="size-2.5" />
                </button>
              </div>
            )
          })}

        {/* 绘制交互层（选中工具后覆盖卷面，拖拽画框） */}
        {tool && (
          <div
            className="absolute inset-0 z-20 cursor-crosshair touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {draft && (
              <div
                className={cn("absolute rounded-sm outline outline-2 outline-dashed", TOOL_STYLE[tool].ring, TOOL_STYLE[tool].fill)}
                style={{
                  left: `${draft.x * 100}%`,
                  top: `${draft.y * 100}%`,
                  width: `${draft.w * 100}%`,
                  height: `${draft.h * 100}%`,
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FrameTag({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn("absolute -top-2 left-1 z-10 rounded px-1 text-[8px] font-medium text-white", className)}
    >
      {label}
    </span>
  )
}

/* ---------------------------- 题目信息配置 ---------------------------- */

function QuestionConfigModal({
  item,
  score,
  onClose,
  onSave,
}: {
  item: { q: Question; gi: number; score: number }
  score: number
  onClose: () => void
  onSave: (score: number) => void
}) {
  const { q } = item
  const [sc, setSc] = useState(score)
  const [correct, setCorrect] = useState<string[]>([])

  return (
    <Modal title={`题目信息配置 · 第 ${item.gi} 题`} onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        {/* 题干预览 */}
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs">
            <span className="rounded bg-card px-1.5 py-0.5 font-medium text-muted-foreground">{q.qType}</span>
            <SourceBadge level={q.level} />
            <span className={cn("rounded px-1.5 py-0.5 font-medium", diffStyle[q.difficulty])}>
              {q.difficulty}
            </span>
          </div>
          <p className="text-sm text-foreground">{q.short}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Labeled label="分值">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={sc}
                onChange={(e) => setSc(Number(e.target.value) || 0)}
                className="w-24 rounded-md border border-input bg-card px-2.5 py-1.5 text-sm outline-none focus:border-brand"
              />
              <span className="text-sm text-muted-foreground">分</span>
            </div>
          </Labeled>
          <Labeled label="题型">
            <div className="rounded-md border border-input bg-muted/50 px-2.5 py-1.5 text-sm text-foreground">
              {q.qType}题
            </div>
          </Labeled>
        </div>

        {/* 答案配置（按题型不同） */}
        <Labeled label="答案">
          <AnswerConfig q={q} correct={correct} setCorrect={setCorrect} />
        </Labeled>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          取消
        </button>
        <button
          onClick={() => onSave(sc)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
        >
          保存配置
        </button>
      </div>
    </Modal>
  )
}

function AnswerConfig({
  q,
  correct,
  setCorrect,
}: {
  q: Question
  correct: string[]
  setCorrect: (v: string[]) => void
}) {
  if (q.qType === "单选" || q.qType === "多选") {
    const multi = q.qType === "多选"
    const opts =
      q.options ??
      [{ key: "A" }, { key: "B" }, { key: "C" }, { key: "D" }].map((o) => ({ ...o, content: "" }))
    return (
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => {
          const on = correct.includes(o.key)
          return (
            <button
              key={o.key}
              onClick={() =>
                setCorrect(
                  multi ? (on ? correct.filter((c) => c !== o.key) : [...correct, o.key]) : [o.key],
                )
              }
              className={cn(
                "size-9 rounded-lg border text-sm font-semibold transition",
                on
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-input text-muted-foreground hover:border-brand/40",
              )}
            >
              {o.key}
            </button>
          )
        })}
        <span className="self-center text-xs text-muted-foreground">
          {multi ? "可多选正确项" : "选择唯一正确项"}
        </span>
      </div>
    )
  }
  if (q.qType === "判断") {
    return (
      <div className="flex gap-2">
        {["正确", "错误"].map((t) => {
          const on = correct.includes(t)
          return (
            <button
              key={t}
              onClick={() => setCorrect([t])}
              className={cn(
                "rounded-lg border px-4 py-1.5 text-sm font-medium transition",
                on
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-input text-muted-foreground hover:border-brand/40",
              )}
            >
              {t}
            </button>
          )
        })}
      </div>
    )
  }
  if (q.qType === "填空") {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">空 {n}</span>
            <input
              placeholder={`第 ${n} 空标准答案`}
              className="flex-1 rounded-md border border-input bg-card px-2.5 py-1.5 text-sm outline-none focus:border-brand"
            />
          </div>
        ))}
        <button className="self-start text-xs font-medium text-brand hover:opacity-80">+ 添加空</button>
      </div>
    )
  }
  /* 主观 */
  return (
    <div className="flex flex-col gap-2">
      <textarea
        placeholder="输入参考答案 / 评分要点"
        rows={3}
        className="w-full resize-none rounded-md border border-input bg-card px-2.5 py-2 text-sm outline-none focus:border-brand"
      />
      <p className="text-xs text-muted-foreground">主观题可由 AI 辅助或人工批阅，参考答案用于给分提示。</p>
    </div>
  )
}

/* ---------------------------- 批量设置 ---------------------------- */

const QTYPE_OPTIONS: QType[] = ["单选", "多选", "填空", "判断", "主观"]
const regionCountOf = (t: QType) => (t === "填空" ? 4 : t === "主观" ? 1 : 1)

type BItem = { id: string; label: string; qType: QType; regions: { id: string; answer: string; score: number }[] }
type BSection = { id: string; title: string; open: boolean; items: BItem[] }

function BatchModal({
  sections,
  scores,
  checkedIds,
  pages,
  onClose,
  onApply,
}: {
  sections: LaidSection[]
  scores: Record<string, number>
  checkedIds: Set<string>
  pages: number
  onClose: () => void
  onApply: (map: Record<string, number>) => void
}) {
  const [data, setData] = useState<BSection[]>(() =>
    sections
      .map((sec, si) => {
        const items = sec.items
          .filter((it) => checkedIds.has(it.q.id))
          .map((it, idx) => {
            const rc = regionCountOf(it.q.qType)
            const per = Math.max(1, Math.round((scores[it.q.id] ?? it.score) / rc))
            return {
              id: it.q.id,
              label: `${CN_NUM[si]}·${idx + 1}`,
              qType: it.q.qType,
              regions: Array.from({ length: rc }, (_, r) => ({ id: `${it.q.id}-r${r}`, answer: "", score: per })),
            } as BItem
          })
        return { id: sec.id, title: sec.title, open: true, items }
      })
      .filter((s) => s.items.length > 0),
  )
  const [curPage, setCurPage] = useState(1)

  const itemScore = (it: BItem) => it.regions.reduce((s, r) => s + r.score, 0)
  const secScore = (s: BSection) => s.items.reduce((sum, it) => sum + itemScore(it), 0)
  const totalCount = data.reduce((n, s) => n + s.items.length, 0)

  const patchSec = (sid: string, fn: (s: BSection) => BSection) =>
    setData((prev) => prev.map((s) => (s.id === sid ? fn(s) : s)))
  const patchItem = (sid: string, iid: string, fn: (it: BItem) => BItem) =>
    patchSec(sid, (s) => ({ ...s, items: s.items.map((it) => (it.id === iid ? fn(it) : it)) }))

  const setSecType = (sid: string, t: QType) =>
    patchSec(sid, (s) => ({
      ...s,
      items: s.items.map((it) => {
        const rc = regionCountOf(t)
        const per = it.regions[0]?.score ?? 2
        return { ...it, qType: t, regions: Array.from({ length: rc }, (_, r) => it.regions[r] ?? { id: `${it.id}-r${r}`, answer: "", score: per }) }
      }),
    }))
  const setSecPer = (sid: string, per: number) =>
    patchSec(sid, (s) => ({ ...s, items: s.items.map((it) => ({ ...it, regions: it.regions.map((r) => ({ ...r, score: per })) })) }))

  const apply = () => {
    const map: Record<string, number> = {}
    data.forEach((s) => s.items.forEach((it) => (map[it.id] = itemScore(it))))
    onApply(map)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* 头 */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="text-base font-bold text-foreground">批量设置 · 共 {totalCount} 小题</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="关闭"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 表头 */}
        <div className="flex shrink-0 items-center gap-3 bg-muted/70 px-5 py-2.5 text-xs font-bold text-foreground">
          <span className="w-52 shrink-0">题号</span>
          <span className="flex-1">题型 / 答案</span>
          <span className="w-24 shrink-0 text-right">分值</span>
        </div>

        {/* 表体 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {data.map((s) => (
            <div key={s.id}>
              {/* 大题行 */}
              <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-5 py-2.5">
                <div className="flex w-52 shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => patchSec(s.id, (x) => ({ ...x, open: !x.open }))}
                    className="grid size-5 place-items-center rounded text-muted-foreground transition hover:bg-muted"
                  >
                    {s.open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </button>
                  <span className="text-sm font-bold text-foreground">{s.title}</span>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <select
                    defaultValue=""
                    onChange={(e) => e.target.value && setSecType(s.id, e.target.value as QType)}
                    className="w-40 rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground outline-none focus:border-brand"
                  >
                    <option value="">请选择</option>
                    {QTYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{qTypeFull(t)}</option>
                    ))}
                  </select>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="每作答区分值"
                      onChange={(e) => e.target.value && setSecPer(s.id, Number(e.target.value) || 0)}
                      className="w-32 rounded-md border border-input bg-card py-1.5 pl-2 pr-6 text-sm outline-none placeholder:text-muted-foreground focus:border-brand"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">分</span>
                  </div>
                </div>
                <span className="w-24 shrink-0 text-right text-sm font-bold text-foreground">{secScore(s).toFixed(1)}分</span>
              </div>

              {/* 小题 + 作答区 */}
              {s.open &&
                s.items.map((it) => (
                  <div key={it.id}>
                    {/* 小题行 */}
                    <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-2.5">
                      <div className="flex w-52 shrink-0 items-center gap-2 pl-6">
                        <span className="text-[13px] text-muted-foreground">小题框</span>
                        <div className="flex items-center gap-1 rounded-md border border-input bg-card px-2 py-1">
                          <span className="text-[11px] text-muted-foreground">题号</span>
                          <input
                            value={it.label}
                            onChange={(e) => patchItem(s.id, it.id, (x) => ({ ...x, label: e.target.value }))}
                            className="w-14 bg-transparent text-[13px] text-foreground outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <select
                          value={it.qType}
                          onChange={(e) => patchItem(s.id, it.id, (x) => {
                            const t = e.target.value as QType
                            const rc = regionCountOf(t)
                            const per = x.regions[0]?.score ?? 2
                            return { ...x, qType: t, regions: Array.from({ length: rc }, (_, r) => x.regions[r] ?? { id: `${x.id}-r${r}`, answer: "", score: per }) }
                          })}
                          className="w-40 rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground outline-none focus:border-brand"
                        >
                          {QTYPE_OPTIONS.map((t) => (
                            <option key={t} value={t}>{qTypeFull(t)}</option>
                          ))}
                        </select>
                      </div>
                      <span className="w-24 shrink-0 text-right text-sm font-semibold text-foreground">{itemScore(it).toFixed(1)}分</span>
                    </div>
                    {/* 作答区行 */}
                    {it.regions.map((r, ri) => (
                      <div key={r.id} className="flex items-center gap-3 border-b border-border px-5 py-2">
                        <span className="w-52 shrink-0 pl-16 text-[13px] text-muted-foreground">作答区{ri + 1}</span>
                        <div className="flex-1">
                          <input
                            value={r.answer}
                            placeholder="请输入答案"
                            onChange={(e) => patchItem(s.id, it.id, (x) => ({ ...x, regions: x.regions.map((rr) => (rr.id === r.id ? { ...rr, answer: e.target.value } : rr)) }))}
                            className="w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-brand"
                          />
                        </div>
                        <div className="relative w-24 shrink-0">
                          <input
                            type="number"
                            value={r.score}
                            onChange={(e) => patchItem(s.id, it.id, (x) => ({ ...x, regions: x.regions.map((rr) => (rr.id === r.id ? { ...rr, score: Number(e.target.value) || 0 } : rr)) }))}
                            className="w-full rounded-md border border-input bg-card py-1.5 pl-2.5 pr-6 text-sm outline-none focus:border-brand"
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">分</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* 底部：缩放/翻页（示意） + 操作 */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <div className="flex items-center gap-3 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            <span className="font-medium">25%</span>
            <Plus className="size-3.5" />
            <span className="h-3 w-px bg-border" />
            <button onClick={() => setCurPage((p) => Math.max(1, p - 1))} className="transition hover:text-foreground">
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="font-medium text-foreground underline">{curPage}</span>
            <button onClick={() => setCurPage((p) => Math.min(pages, p + 1))} className="transition hover:text-foreground">
              <ChevronRight className="size-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-brand/40 px-6 py-2 text-sm font-medium text-brand transition hover:bg-brand-soft/50"
            >
              取消
            </button>
            <button
              onClick={apply}
              className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- 小组件 ---------------------------- */

function HeaderBtn({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
      <Icon className="size-4" />
      {children}
    </button>
  )
}

function ToolIcon({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="grid size-7 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function ToolText({
  icon: Icon,
  children,
  onClick,
}: {
  icon: React.ElementType
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  )
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn("relative h-5 w-9 rounded-full transition", on ? "bg-brand" : "bg-muted-foreground/30")}
      role="switch"
      aria-checked={on}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full bg-white shadow transition",
          on ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  )
}

function LegendRow({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("size-3 rounded-sm border", className)} />
      {label}
    </span>
  )
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition",
        active ? "border-b-2 border-brand text-brand" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {children}
    </button>
  )
}

function StatusIcon({ status }: { status: "done" | "warn" | "none" }) {
  if (status === "done") return <CheckCircle2 className="size-4 shrink-0 text-easy" />
  if (status === "warn") return <AlertTriangle className="size-4 shrink-0 text-warn-foreground" />
  return <XCircle className="size-4 shrink-0 text-destructive" />
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-foreground">{label}</span>
      {children}
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
  wide,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn("relative w-full rounded-2xl bg-card p-5 shadow-xl", wide ? "max-w-lg" : "max-w-sm")}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="关闭"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
