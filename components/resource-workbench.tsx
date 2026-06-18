"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Eye,
  ShoppingBasket,
  Pencil,
  Check,
  Rows3,
  StretchHorizontal,
  PlayCircle,
  FileText,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChapterSidebar } from "@/components/chapter-sidebar"
import { SourceBadge, type Level } from "@/components/source-badge"
import { Math } from "@/components/math"

/* ---------------------------- 数据 ---------------------------- */

type QType = "单选" | "多选" | "填空" | "判断" | "主观"
type Difficulty = "易" | "中" | "难"

type Question = {
  id: string
  qType: QType
  level: Level
  difficulty: Difficulty
  knowledge: string[]
  tags: string[]
  stem: ReactNode
  options?: { key: string; content: ReactNode }[]
  answer: ReactNode
  analysis: ReactNode
  used: number
  students: number
  hasVideo?: boolean
  editable?: boolean
}

const questions: Question[] = [
  {
    id: "q1",
    qType: "单选",
    level: "市",
    difficulty: "易",
    knowledge: ["一元一次不等式", "解集表示"],
    tags: ["基础巩固", "课堂讲解"],
    stem: (
      <>
        不等式 <Math tex="2x - 1 > 3" /> 的解集是（　　）
      </>
    ),
    options: [
      { key: "A", content: <Math tex="x > 1" /> },
      { key: "B", content: <Math tex="x > 2" /> },
      { key: "C", content: <Math tex="x < 2" /> },
      { key: "D", content: <Math tex="x \geq 2" /> },
    ],
    answer: <Math tex="\text{B}" />,
    analysis: (
      <>
        移项得 <Math tex="2x > 4" />，两边同除以 2，不等号方向不变，得{" "}
        <Math tex="x > 2" />，故选 B。
      </>
    ),
    used: 326,
    students: 1280,
    hasVideo: true,
  },
  {
    id: "q2",
    qType: "填空",
    level: "区",
    difficulty: "中",
    knowledge: ["一元一次不等式组", "公共解集"],
    tags: ["易错训练", "数轴表示"],
    stem: (
      <>
        不等式组{" "}
        <Math tex="\begin{cases} x > 2 \\ x \geq 1 \end{cases}" /> 的解集是{" "}
        <span className="mx-1 inline-block min-w-16 border-b border-foreground/40 align-bottom" />
        。
      </>
    ),
    answer: <Math tex="x > 2" />,
    analysis: (
      <>
        两不等式取公共部分，<Math tex="x > 2" /> 与 <Math tex="x \geq 1" />{" "}
        的公共解集为 <Math tex="x > 2" />（同大取大）。
      </>
    ),
    used: 91,
    students: 540,
    editable: true,
  },
  {
    id: "q3",
    qType: "判断",
    level: "校",
    difficulty: "易",
    knowledge: ["不等式性质"],
    tags: ["概念辨析"],
    stem: (
      <>
        不等式两边同时乘以同一个负数，不等号方向不变。（　　）
      </>
    ),
    answer: <span className="font-medium">错误</span>,
    analysis: (
      <>
        不等式两边同乘以同一个<strong>负数</strong>时，不等号方向必须改变，故本题错误。
      </>
    ),
    used: 64,
    students: 320,
    editable: true,
  },
  {
    id: "q4",
    qType: "主观",
    level: "市",
    difficulty: "难",
    knowledge: ["一元一次不等式组", "解集规律", "数轴表示"],
    tags: ["单元复习", "规律梳理", "含视频讲解"],
    stem: (
      <>
        总结四种不同类型的一元一次不等式组（设 <Math tex="a < b" />）的解集规律，并在数轴上表示。
      </>
    ),
    answer: (
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-center text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="border-b border-border px-3 py-2 font-medium">不等式组</th>
              <th className="border-b border-border px-3 py-2 font-medium">解集</th>
              <th className="border-b border-border px-3 py-2 font-medium">口诀</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-border px-3 py-2">
                <Math tex="x > a,\ x > b" />
              </td>
              <td className="border-b border-border px-3 py-2">
                <Math tex="x > b" />
              </td>
              <td className="border-b border-border px-3 py-2">同大取大</td>
            </tr>
            <tr>
              <td className="border-b border-border px-3 py-2">
                <Math tex="x < a,\ x < b" />
              </td>
              <td className="border-b border-border px-3 py-2">
                <Math tex="x < a" />
              </td>
              <td className="border-b border-border px-3 py-2">同小取小</td>
            </tr>
            <tr>
              <td className="border-b border-border px-3 py-2">
                <Math tex="x > a,\ x < b" />
              </td>
              <td className="border-b border-border px-3 py-2">
                <Math tex="a < x < b" />
              </td>
              <td className="border-b border-border px-3 py-2">大小交叉中间找</td>
            </tr>
            <tr>
              <td className="px-3 py-2">
                <Math tex="x < a,\ x > b" />
              </td>
              <td className="px-3 py-2">无解</td>
              <td className="px-3 py-2">小大交叉无解了</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
    analysis: (
      <>
        引导学生按"同大、同小、交叉"分类记忆，配合数轴上"两条射线的公共部分"理解，避免死记。
      </>
    ),
    used: 218,
    students: 96,
    hasVideo: true,
  },
  {
    id: "q5",
    qType: "单选",
    level: "我",
    difficulty: "中",
    knowledge: ["一元一次不等式", "实际应用"],
    tags: ["情景应用", "校本改编"],
    stem: (
      <>
        某次知识竞赛共 20 题，答对一题得 5 分，答错或不答扣 2 分。小明要得分不低于 79
        分，他至少要答对（　　）题。
      </>
    ),
    options: [
      { key: "A", content: "16" },
      { key: "B", content: "17" },
      { key: "C", content: "18" },
      { key: "D", content: "19" },
    ],
    answer: <Math tex="\text{B}" />,
    analysis: (
      <>
        设答对 <Math tex="x" /> 题，则 <Math tex="5x - 2(20 - x) \geq 79" />，解得{" "}
        <Math tex="x \geq 17" />，故至少答对 17 题。
      </>
    ),
    used: 37,
    students: 88,
    editable: true,
  },
]

const qTypeFilters: ("全部" | QType)[] = ["全部", "单选", "多选", "填空", "判断", "主观"]
const sourceFilters: ("全部" | Level)[] = ["全部", "市", "区", "校", "我"]
const diffFilters: ("全部" | Difficulty)[] = ["全部", "易", "中", "难"]
const resourceTypes = ["题目", "作业", "备课", "微课"]

const diffStyle: Record<Difficulty, string> = {
  易: "text-easy bg-easy/10",
  中: "text-medium bg-medium/15",
  难: "text-hard bg-hard/10",
}

/* ---------------------------- 题目卡 ---------------------------- */

function QuestionCard({
  q,
  index,
  selected,
  compact,
  onToggle,
}: {
  q: Question
  index: number
  selected: boolean
  compact: boolean
  onToggle: () => void
}) {
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <article
      className={cn(
        "group rounded-xl border bg-card transition",
        selected
          ? "border-brand ring-1 ring-brand/30"
          : "border-border hover:border-brand/40",
      )}
    >
      <div className="flex gap-3 p-4 sm:p-5">
        {/* 选题勾选 */}
        <button
          onClick={onToggle}
          aria-label={selected ? "取消选择" : "选择此题"}
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition",
            selected
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border bg-background text-transparent hover:border-brand",
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </button>

        <div className="min-w-0 flex-1">
          {/* 顶部元信息 */}
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-muted-foreground">{index}</span>
            <span className="rounded bg-brand-soft px-1.5 py-0.5 font-medium text-brand-soft-foreground">
              {q.qType}
            </span>
            <SourceBadge level={q.level} />
            <span
              className={cn(
                "rounded px-1.5 py-0.5 font-medium",
                diffStyle[q.difficulty],
              )}
            >
              {q.difficulty}
            </span>
            {q.hasVideo && (
              <span className="inline-flex items-center gap-0.5 rounded bg-warn/20 px-1.5 py-0.5 font-medium text-warn-foreground">
                <PlayCircle className="size-3" />
                视频讲解
              </span>
            )}
            <span className="ml-auto hidden text-muted-foreground sm:inline">
              组卷 {q.used} · 已练 {q.students} 人
            </span>
          </div>

          {/* 题干 */}
          <div
            className={cn(
              "text-[15px] leading-7 text-foreground",
              compact && "line-clamp-2",
            )}
          >
            {q.stem}
          </div>

          {/* 选项 / 答案（详情模式） */}
          {!compact && (
            <>
              {q.options && (
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  {q.options.map((o) => (
                    <div key={o.key} className="flex items-baseline gap-2 text-sm text-foreground">
                      <span className="font-medium text-muted-foreground">{o.key}.</span>
                      <span>{o.content}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 标签 + 展开解析 */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {q.knowledge.map((k) => (
                  <span
                    key={k}
                    className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-soft-foreground"
                  >
                    {k}
                  </span>
                ))}
                {q.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
                <button
                  onClick={() => setShowAnalysis((v) => !v)}
                  className="ml-auto inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-medium text-brand hover:bg-brand-soft"
                >
                  答案解析
                  <ChevronDown
                    className={cn("size-3.5 transition", showAnalysis && "rotate-180")}
                  />
                </button>
              </div>

              {showAnalysis && (
                <div className="mt-3 space-y-2 rounded-lg bg-muted/60 p-3 text-sm leading-7">
                  <div className="flex gap-2">
                    <span className="shrink-0 font-medium text-brand">【答案】</span>
                    <div>{q.answer}</div>
                  </div>
                  <div className="flex gap-2 text-muted-foreground">
                    <span className="shrink-0 font-medium text-foreground">【解析】</span>
                    <div>{q.analysis}</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 精简模式：标签一行 */}
          {compact && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {q.knowledge.slice(0, 3).map((k) => (
                <span
                  key={k}
                  className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-soft-foreground"
                >
                  {k}
                </span>
              ))}
            </div>
          )}

          {/* 动作行 */}
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <button
              onClick={onToggle}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
                selected
                  ? "bg-brand-soft text-brand-soft-foreground"
                  : "bg-brand text-brand-foreground hover:opacity-90",
              )}
            >
              <ShoppingBasket className="size-4" />
              {selected ? "已加入题篮" : "加入题篮"}
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-brand/40 hover:text-foreground">
              <Eye className="size-3.5" />
              预览
            </button>
            {q.editable && (
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-brand/40 hover:text-foreground">
                <Pencil className="size-3.5" />
                编辑
              </button>
            )}
            <span className="ml-auto text-xs text-muted-foreground sm:hidden">
              组卷 {q.used}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ---------------------------- 主组件 ---------------------------- */

export function ResourceWorkbench() {
  const [resourceType, setResourceType] = useState("题目")
  const [qType, setQType] = useState<"全部" | QType>("全部")
  const [source, setSource] = useState<"全部" | Level>("全部")
  const [diff, setDiff] = useState<"全部" | Difficulty>("全部")
  const [compact, setCompact] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [chapterOpen, setChapterOpen] = useState(true)

  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const filtered = useMemo(
    () =>
      questions.filter((q) => {
        if (qType !== "全部" && q.qType !== qType) return false
        if (source !== "全部" && q.level !== source) return false
        if (diff !== "全部" && q.difficulty !== diff) return false
        return true
      }),
    [qType, source, diff],
  )

  return (
    <div className="flex min-h-full flex-col">
      {/* 贴顶工具栏 */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-6 py-3">
          <nav className="flex items-center gap-1 text-[13px] text-muted-foreground">
            {["七年级下", "第15章 一元一次不等式"].map((b, i, arr) => (
              <span key={b} className="flex items-center gap-1">
                <span className={cn(i === arr.length - 1 && "font-semibold text-foreground")}>
                  {b}
                </span>
                {i < arr.length - 1 && <ChevronRight className="size-3.5" />}
              </span>
            ))}
          </nav>

          {/* 资源类型分段控制 */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
            {resourceTypes.map((t) => (
              <button
                key={t}
                onClick={() => setResourceType(t)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  resourceType === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="搜索题干、知识点、标签"
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <Link
            href="/new-question"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
          >
            <Plus className="size-4" />
            新增题目
          </Link>
        </div>
      </div>

      <div className="flex flex-1 gap-0">
        {/* 章节栏 */}
        <aside
          className={cn(
            "hidden shrink-0 border-r border-border bg-card transition-all lg:block",
            chapterOpen ? "w-64" : "w-0 overflow-hidden",
          )}
        >
          <div className="sticky top-[57px] p-4">
            <ChapterSidebar />
          </div>
        </aside>

        {/* 主内容 */}
        <main className="min-w-0 flex-1">
          {/* 筛选条 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-6 py-3">
            <button
              onClick={() => setChapterOpen((v) => !v)}
              className="hidden items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground lg:inline-flex"
            >
              <SlidersHorizontal className="size-3.5" />
              {chapterOpen ? "收起目录" : "展开目录"}
            </button>

            <FilterGroup label="来源" items={sourceFilters} active={source} onChange={(v) => setSource(v as typeof source)} />
            <FilterGroup label="题型" items={qTypeFilters} active={qType} onChange={(v) => setQType(v as typeof qType)} />
            <FilterGroup label="难度" items={diffFilters} active={diff} onChange={(v) => setDiff(v as typeof diff)} />

            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                共 <span className="font-semibold text-foreground">{filtered.length}</span> 题
              </span>
              <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
                <button
                  onClick={() => setCompact(false)}
                  className={cn(
                    "rounded-md p-1.5 transition",
                    !compact ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                  aria-label="详情视图"
                >
                  <StretchHorizontal className="size-4" />
                </button>
                <button
                  onClick={() => setCompact(true)}
                  className={cn(
                    "rounded-md p-1.5 transition",
                    compact ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                  aria-label="精简视图"
                >
                  <Rows3 className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 列表 */}
          <div className="px-6 py-4">
            {resourceType === "题目" ? (
              <div className={cn("flex flex-col", compact ? "gap-2" : "gap-3", "pb-24")}>
                {filtered.map((q, i) => (
                  <QuestionCard
                    key={q.id}
                    q={q}
                    index={i + 1}
                    selected={selected.includes(q.id)}
                    compact={compact}
                    onToggle={() => toggle(q.id)}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="py-20 text-center text-sm text-muted-foreground">
                    当前筛选下暂无题目，换个条件试试
                  </div>
                )}
              </div>
            ) : (
              <OtherResourcePlaceholder type={resourceType} />
            )}
          </div>
        </main>
      </div>

      {/* 题篮浮条 */}
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 shadow-lg">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShoppingBasket className="size-4 text-brand" />
            题篮 {selected.length} 题
          </span>
          <button className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition hover:opacity-90">
            组卷 / 布置
          </button>
          <button
            onClick={() => setSelected([])}
            className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="清空题篮"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------------------------- 子组件 ---------------------------- */

function FilterGroup<T extends string>({
  label,
  items,
  active,
  onChange,
}: {
  label: string
  items: readonly T[]
  active: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-1">
        {items.map((it) => (
          <button
            key={it}
            onClick={() => onChange(it)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[13px] transition",
              active === it
                ? "bg-brand-soft font-medium text-brand-soft-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {it}
          </button>
        ))}
      </div>
    </div>
  )
}

function OtherResourcePlaceholder({ type }: { type: string }) {
  const icon =
    type === "微课" ? PlayCircle : type === "备课" ? FileText : Sparkles
  const Icon = icon
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon className="size-6" />
      </div>
      <p className="text-sm font-medium text-foreground">{type}资源</p>
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
        本演示聚焦「题目」的阅读与选题体验，{type}资源沿用同一套来源筛选与卡片规范。
      </p>
    </div>
  )
}
