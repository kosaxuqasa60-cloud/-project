"use client"

import { useMemo, useState } from "react"
import {
  ChevronLeft,
  ClipboardList,
  FileText,
  ScanLine,
  SquareDashed,
  Square,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ListTree,
  Rows3,
  Settings2,
  X,
  Layers,
  Sparkles,
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
  A4: { label: "A4 卷码纸", ratio: "210 / 297", cap: 108, mm: "210 × 297 mm" },
  B3: { label: "B3 卷码纸", ratio: "353 / 500", cap: 190, mm: "353 × 500 mm" },
}

export type LaidSection = { id: string; title: string; items: { q: Question; score: number }[] }

type BoxState = Record<string, { q: boolean; a: boolean }>
type Tool = "题目框" | "答案框"

export function DotPenLayout({
  name,
  sections,
  onBack,
}: {
  name: string
  sections: LaidSection[]
  onBack: () => void
}) {
  const [paper, setPaper] = useState<PaperSize>("A4")
  const [columns, setColumns] = useState<1 | 2>(1)
  const [fontSize, setFontSize] = useState<"小" | "中" | "大">("中")
  const [answerCard, setAnswerCard] = useState(true)
  const [autoFrame, setAutoFrame] = useState(true)
  const [tool, setTool] = useState<Tool>("答案框")
  const [tab, setTab] = useState<"byQ" | "byLevel">("byQ")
  const [selected, setSelected] = useState<string | null>(null)
  const [configFor, setConfigFor] = useState<string | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [batchOpen, setBatchOpen] = useState(false)

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

  /* 框选状态：默认自动全框 */
  const [boxes, setBoxes] = useState<BoxState>(() => {
    const b: BoxState = {}
    flat.forEach((f) => (b[f.q.id] = { q: true, a: true }))
    return b
  })

  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(flat.map((f) => [f.q.id, f.score])),
  )

  const capacity = PAPER[paper].cap * columns
  /* 自动分页 */
  const pages = useMemo(() => {
    const result: typeof flat[] = []
    let cur: typeof flat = []
    let used = 0
    flat.forEach((f) => {
      const h = UNIT[f.q.qType] + (f.q.qType === "主观" && answerCard ? 6 : 0)
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
  }, [flat, capacity, answerCard])

  const statusOf = (id: string): "done" | "warn" | "none" => {
    const b = boxes[id]
    if (b?.q && b?.a) return "done"
    if (b?.q || b?.a) return "warn"
    return "none"
  }

  const toggleAuto = (on: boolean) => {
    setAutoFrame(on)
    setBoxes((prev) => {
      const next: BoxState = {}
      flat.forEach((f) => (next[f.q.id] = on ? { q: true, a: true } : { q: false, a: false }))
      return next
    })
  }

  const toggleBox = (id: string, kind: "q" | "a") => {
    setBoxes((prev) => ({ ...prev, [id]: { ...prev[id], [kind]: !prev[id]?.[kind] } }))
  }

  const doneCount = flat.filter((f) => statusOf(f.q.id) === "done").length

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 顶部：步骤条 + 保存 */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/85 px-5 py-3 backdrop-blur">
        <button
          onClick={onBack}
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          返回练习编辑
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ScanLine className="size-5 text-brand" />
              <h1 className="truncate text-lg font-bold text-foreground">{name} · 排版与框选</h1>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <StepDot n={1} label="生成练习" done />
              <span className="h-px w-6 bg-border" />
              <StepDot n={2} label="排版与框选" active />
              <span className="h-px w-6 bg-border" />
              <StepDot n={3} label="布置" />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                doneCount === flat.length
                  ? "bg-easy/15 text-easy"
                  : "bg-warn/20 text-warn-foreground",
              )}
            >
              已框选 {doneCount}/{flat.length}
            </span>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90">
              <ClipboardList className="size-4" />
              保存并去布置
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 左栏：排版 + 框选工具 */}
        <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-card p-4 lg:flex">
          {/* 纸张类型 */}
          <SideTitle icon={FileText}>卷码纸尺寸</SideTitle>
          <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
            选定尺寸后，系统在该尺寸下自动排版，套打到已铺码的卷码纸上。
          </p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {(Object.keys(PAPER) as PaperSize[]).map((p) => (
              <button
                key={p}
                onClick={() => setPaper(p)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition",
                  paper === p
                    ? "border-brand bg-brand-soft text-brand-soft-foreground"
                    : "border-border text-muted-foreground hover:border-brand/40",
                )}
              >
                <span
                  className="w-7 rounded-sm border border-current opacity-70"
                  style={{ aspectRatio: PAPER[p].ratio }}
                />
                <span className="font-semibold">{p}</span>
                <span className="text-[10px] opacity-70">{PAPER[p].mm}</span>
              </button>
            ))}
          </div>

          {/* 排版参数 */}
          <SideTitle icon={Layers}>排版参数</SideTitle>
          <div className="mb-4 flex flex-col gap-3">
            <div>
              <span className="mb-1 block text-[11px] text-muted-foreground">分栏</span>
              <Segmented
                value={String(columns)}
                options={[
                  { v: "1", l: "单栏" },
                  { v: "2", l: "双栏" },
                ]}
                onChange={(v) => setColumns(v === "2" ? 2 : 1)}
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] text-muted-foreground">字号</span>
              <Segmented
                value={fontSize}
                options={[
                  { v: "小", l: "小" },
                  { v: "中", l: "中" },
                  { v: "大", l: "大" },
                ]}
                onChange={(v) => setFontSize(v as "小" | "中" | "大")}
              />
            </div>
            <label className="flex items-center justify-between text-xs text-foreground">
              客观题独立答题卡区
              <Switch on={answerCard} onChange={setAnswerCard} />
            </label>
          </div>

          {/* 框选 */}
          <SideTitle icon={SquareDashed}>框选</SideTitle>
          <label className="mb-2 flex items-center justify-between rounded-lg bg-muted/60 px-2.5 py-2 text-xs font-medium text-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-brand" />
              自动框选
            </span>
            <Switch on={autoFrame} onChange={toggleAuto} />
          </label>
          <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
            版面坐标已知，开启后自动生成全部框。关闭后可用下方工具在卷面点击题目区/作答区手动增删框。
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {(["题目框", "答案框"] as Tool[]).map((t) => (
              <button
                key={t}
                onClick={() => setTool(t)}
                disabled={autoFrame}
                className={cn(
                  "flex items-center justify-center gap-1 rounded-lg border py-2 text-xs font-medium transition disabled:opacity-40",
                  tool === t
                    ? "border-brand bg-brand-soft text-brand-soft-foreground"
                    : "border-border text-muted-foreground hover:border-brand/40",
                )}
              >
                {t === "题目框" ? <Square className="size-3.5" /> : <SquareDashed className="size-3.5" />}
                {t}
              </button>
            ))}
          </div>
          {/* 图例 */}
          <div className="flex flex-col gap-1.5 rounded-lg border border-border p-2.5 text-[11px] text-muted-foreground">
            <LegendRow className="border-sky-400 bg-sky-400/10" label="题目框（印刷题干区）" />
            <LegendRow className="border-brand bg-brand/10" label="答案框（手写作答区）" />
            <LegendRow className="border-destructive bg-destructive/10" label="未框选题目" />
          </div>
        </aside>

        {/* 中间：卷面画布 */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40 px-6 py-6">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
            {pages.map((pageItems, pi) => (
              <PaperSheet
                key={pi}
                pageIndex={pi + 1}
                pageCount={pages.length}
                size={paper}
                columns={columns}
                fontSize={fontSize}
                items={pageItems}
                boxes={boxes}
                selected={selected}
                autoFrame={autoFrame}
                tool={tool}
                onSelect={(id) => {
                  setSelected(id)
                  setTab("byQ")
                }}
                onToggleBox={toggleBox}
              />
            ))}
          </div>
        </div>

        {/* 右栏：两个 Tab */}
        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-border bg-card md:flex">
          <div className="flex shrink-0 border-b border-border">
            <TabBtn active={tab === "byQ"} onClick={() => setTab("byQ")} icon={Rows3}>
              按题查看
            </TabBtn>
            <TabBtn active={tab === "byLevel"} onClick={() => setTab("byLevel")} icon={ListTree}>
              按层级查看
            </TabBtn>
          </div>

          {tab === "byQ" ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <div className="mb-2 flex items-center gap-3 px-1 text-[11px] text-muted-foreground">
                <StatusChip status="done" /> 已框选
                <StatusChip status="warn" /> 缺答案框
                <StatusChip status="none" /> 未框选
              </div>
              <div className="flex flex-col gap-1.5">
                {flat.map((f) => {
                  const st = statusOf(f.q.id)
                  return (
                    <button
                      key={f.q.id}
                      onClick={() => {
                        setSelected(f.q.id)
                        setConfigFor(f.q.id)
                      }}
                      className={cn(
                        "flex items-start gap-2 rounded-lg border p-2.5 text-left transition",
                        selected === f.q.id
                          ? "border-brand bg-brand-soft/50"
                          : "border-border hover:border-brand/40",
                      )}
                    >
                      <StatusIcon status={st} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-muted-foreground">{f.gi}.</span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {f.q.qType}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{scores[f.q.id]} 分</span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-foreground">{f.q.short}</p>
                      </div>
                      <Settings2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  )
                })}
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
          count={checked.size}
          onClose={() => setBatchOpen(false)}
          onApply={(sc) => {
            if (sc != null) setScores((prev) => {
              const next = { ...prev }
              checked.forEach((id) => (next[id] = sc))
              return next
            })
            setBatchOpen(false)
          }}
        />
      )}
    </div>
  )
}

/* ---------------------------- 卷面 ---------------------------- */

function PaperSheet({
  pageIndex,
  pageCount,
  size,
  columns,
  fontSize,
  items,
  boxes,
  selected,
  autoFrame,
  tool,
  onSelect,
  onToggleBox,
}: {
  pageIndex: number
  pageCount: number
  size: PaperSize
  columns: 1 | 2
  fontSize: "小" | "中" | "大"
  items: { q: Question; score: number; gi: number; secTitle: string; secIdx: number }[]
  boxes: BoxState
  selected: string | null
  autoFrame: boolean
  tool: Tool
  onSelect: (id: string) => void
  onToggleBox: (id: string, kind: "q" | "a") => void
}) {
  const fsCls = fontSize === "小" ? "text-[11px]" : fontSize === "大" ? "text-[15px]" : "text-[13px]"
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>{PAPER[size].label}</span>
        <span>第 {pageIndex} / {pageCount} 页</span>
      </div>
      <div
        className="relative rounded-sm bg-white shadow-md ring-1 ring-border"
        style={{
          aspectRatio: PAPER[size].ratio,
          backgroundImage:
            "radial-gradient(oklch(0.85 0.02 250 / 0.5) 0.5px, transparent 0.5px)",
          backgroundSize: "6px 6px",
        }}
      >
        <div className="absolute inset-0 overflow-hidden p-[5%]">
          {pageIndex === 1 && (
            <div className="mb-3 border-b-2 border-neutral-800 pb-2 text-center">
              <p className="text-sm font-bold text-neutral-900">课堂练习（点阵笔作答）</p>
              <p className="mt-0.5 text-[10px] text-neutral-500">
                姓名：__________ 班级：__________ 学号：__________
              </p>
            </div>
          )}
          <div
            className={cn("gap-x-4", columns === 2 ? "columns-2" : "columns-1")}
          >
            {items.map((it) => {
              const b = boxes[it.q.id] ?? { q: false, a: false }
              const isSel = selected === it.q.id
              const unframed = !b.q && !b.a
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
                  {/* 题目框 */}
                  <div
                    className={cn(
                      "relative rounded-sm p-1",
                      b.q ? "outline outline-1 outline-sky-400 bg-sky-400/5" : "",
                      !autoFrame && "cursor-pointer",
                    )}
                    onClick={(e) => {
                      if (!autoFrame && tool === "题目框") {
                        e.stopPropagation()
                        onToggleBox(it.q.id, "q")
                      }
                    }}
                  >
                    {b.q && <FrameTag className="bg-sky-500" label="题目框" />}
                    <p className={cn("leading-snug text-neutral-900", fsCls)}>
                      <span className="font-semibold">{it.gi}. </span>
                      {it.q.short}
                      <span className="ml-1 text-[10px] text-neutral-400">（{it.score}分）</span>
                    </p>
                    {it.q.options && (
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                        {it.q.options.map((o) => (
                          <span key={o.key} className={cn("text-neutral-700", fsCls)}>
                            {o.key}. {o.content}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* 答案框 */}
                  <div
                    className={cn(
                      "relative mt-1 rounded-sm",
                      b.a
                        ? "outline outline-1 outline-[oklch(0.58_0.1_158)] bg-brand/5"
                        : "border border-dashed border-neutral-300",
                      it.q.qType === "主观" ? "h-12" : it.q.qType === "填空" ? "h-7" : "h-6",
                      !autoFrame && "cursor-pointer",
                    )}
                    onClick={(e) => {
                      if (!autoFrame && tool === "答案框") {
                        e.stopPropagation()
                        onToggleBox(it.q.id, "a")
                      }
                    }}
                  >
                    {b.a && <FrameTag className="bg-[oklch(0.58_0.1_158)]" label="答案框" />}
                    <span className="absolute left-1 top-0.5 text-[9px] text-neutral-400">作答区</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function FrameTag({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "absolute -top-2 left-1 z-10 rounded px-1 text-[8px] font-medium text-white",
        className,
      )}
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
    const opts = q.options ?? [{ key: "A" }, { key: "B" }, { key: "C" }, { key: "D" }].map((o) => ({ ...o, content: "" }))
    return (
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => {
          const on = correct.includes(o.key)
          return (
            <button
              key={o.key}
              onClick={() =>
                setCorrect(
                  multi
                    ? on
                      ? correct.filter((c) => c !== o.key)
                      : [...correct, o.key]
                    : [o.key],
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

function BatchModal({
  count,
  onClose,
  onApply,
}: {
  count: number
  onClose: () => void
  onApply: (score: number | null) => void
}) {
  const [enableScore, setEnableScore] = useState(true)
  const [sc, setSc] = useState(3)
  return (
    <Modal title={`批量设置 · 已选 ${count} 题`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <span className="text-sm font-medium text-foreground">统一分值</span>
          <Switch on={enableScore} onChange={setEnableScore} />
        </label>
        {enableScore && (
          <div className="flex items-center gap-2 pl-1">
            <span className="text-sm text-muted-foreground">每题</span>
            <input
              type="number"
              value={sc}
              onChange={(e) => setSc(Number(e.target.value) || 0)}
              className="w-24 rounded-md border border-input bg-card px-2.5 py-1.5 text-sm outline-none focus:border-brand"
            />
            <span className="text-sm text-muted-foreground">分</span>
          </div>
        )}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          取消
        </button>
        <button
          onClick={() => onApply(enableScore ? sc : null)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
        >
          应用到 {count} 题
        </button>
      </div>
    </Modal>
  )
}

/* ---------------------------- 小组件 ---------------------------- */

function StepDot({ n, label, done, active }: { n: number; label: string; done?: boolean; active?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          "grid size-4 place-items-center rounded-full text-[10px] font-bold",
          done
            ? "bg-brand text-brand-foreground"
            : active
              ? "bg-brand text-brand-foreground"
              : "bg-muted text-muted-foreground",
        )}
      >
        {done ? "✓" : n}
      </span>
      <span className={cn(active || done ? "font-medium text-foreground" : "")}>{label}</span>
    </span>
  )
}

function SideTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground">
      <Icon className="size-3.5 text-brand" />
      {children}
    </h3>
  )
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string
  options: { v: string; l: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex rounded-lg bg-muted p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "flex-1 rounded-md py-1 text-xs font-medium transition",
            value === o.v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
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

function StatusChip({ status }: { status: "done" | "warn" | "none" }) {
  const cls =
    status === "done"
      ? "bg-easy"
      : status === "warn"
        ? "bg-warn"
        : "bg-destructive"
  return <span className={cn("inline-block size-2 rounded-full", cls)} />
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
        className={cn(
          "relative w-full rounded-2xl bg-card p-5 shadow-xl",
          wide ? "max-w-lg" : "max-w-sm",
        )}
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
