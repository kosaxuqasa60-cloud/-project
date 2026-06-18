"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  ChevronDown,
  ShoppingCart,
  Rows3,
  StretchHorizontal,
  PlayCircle,
  FileText,
  PanelLeftClose,
  PanelLeft,
  X,
  Trash2,
  Crown,
  Lock,
  Layers,
  ClipboardList,
  Clapperboard,
  Eye,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChapterSidebar } from "@/components/chapter-sidebar"
import { SourceBadge, type Level } from "@/components/source-badge"
import { Math } from "@/components/math"
import { TextbookSwitcher } from "@/components/textbook-switcher"

/* ---------------------------- 数据 ---------------------------- */

type QType = "单选" | "多选" | "填空" | "判断" | "主观"
type Difficulty = "易" | "中" | "难"

type Question = {
  id: string
  qType: QType
  level: Level
  difficulty: Difficulty
  /* 大题归类：题篮按大题分组 */
  group: string
  knowledge: string[]
  literacy: string[]
  cognitive: string
  tags: string[]
  stem: ReactNode
  short: string
  options?: { key: string; content: ReactNode }[]
  answer: ReactNode
  analysis: ReactNode
  used: number
  students: number
  videoTitle: string
  videoDuration: string
  editable?: boolean
}

const questions: Question[] = [
  {
    id: "q1",
    qType: "单选",
    level: "市",
    difficulty: "易",
    group: "第15章 一元一次不等式 · 基础过关",
    knowledge: ["一元一次不等式", "解集表示"],
    literacy: ["数学运算"],
    cognitive: "理解",
    tags: ["基础巩固", "课堂讲解"],
    short: "不等式 2x-1>3 的解集",
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
    videoTitle: "一元一次不等式的解法",
    videoDuration: "06:12",
  },
  {
    id: "q2",
    qType: "填空",
    level: "区",
    difficulty: "中",
    group: "第15章 一元一次不等式 · 基础过关",
    knowledge: ["一元一次不等式组", "公共解集"],
    literacy: ["数学运算", "逻辑推理"],
    cognitive: "应用",
    tags: ["易错训练", "数轴表示"],
    short: "不等式组的公共解集",
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
    videoTitle: "不等式组公共解集的确定",
    videoDuration: "08:30",
    editable: true,
  },
  {
    id: "q3",
    qType: "判断",
    level: "校",
    difficulty: "易",
    group: "第15章 一元一次不等式 · 概念辨析",
    knowledge: ["不等式性质"],
    literacy: ["逻辑推理"],
    cognitive: "记忆",
    tags: ["概念辨析"],
    short: "不等式两边同乘负数，方向不变？",
    stem: <>不等式两边同时乘以同一个负数，不等号方向不变。（　　）</>,
    answer: <span className="font-medium">错误</span>,
    analysis: (
      <>
        不等式两边同乘以同一个<strong>负数</strong>时，不等号方向必须改变，故本题错误。
      </>
    ),
    used: 64,
    students: 320,
    videoTitle: "不等式的三条基本性质",
    videoDuration: "05:48",
    editable: true,
  },
  {
    id: "q4",
    qType: "主观",
    level: "市",
    difficulty: "难",
    group: "第15章 一元一次不等式 · 综合提升",
    knowledge: ["一元一次不等式组", "解集规律", "数轴表示"],
    literacy: ["逻辑推理", "直观想象"],
    cognitive: "分析综合",
    tags: ["单元复习", "规律梳理"],
    short: "总结四种不等式组的解集规律",
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
    videoTitle: "不等式组解集规律的可视化推导",
    videoDuration: "12:05",
  },
  {
    id: "q5",
    qType: "单选",
    level: "我",
    difficulty: "中",
    group: "第15章 一元一次不等式 · 综合提升",
    knowledge: ["一元一次不等式", "实际应用"],
    literacy: ["数学建模", "数学运算"],
    cognitive: "应用",
    tags: ["情景应用", "校本改编"],
    short: "知识竞赛得分不低于79分",
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
    videoTitle: "列不等式解决实际问题",
    videoDuration: "09:20",
    editable: true,
  },
]

/* 其他资源类型数据 */
type ResItem = {
  id: string
  title: string
  level: Level
  meta: string[]
  tags: string[]
  action: string
  hasVideo?: boolean
  /* 试卷/资源包内题目（预览二级页用） */
  qIds?: string[]
  videoCount?: number
}

const homeworkData: ResItem[] = [
  {
    id: "hw1",
    title: "第15章 一元一次不等式 · 单元复习作业",
    level: "区",
    meta: ["5 题", "难度 基础-提升", "已布置 6 个班", "使用 218 次"],
    tags: ["单元复习", "分层练习", "点阵笔适配"],
    action: "布置作业",
    qIds: ["q1", "q2", "q3", "q4", "q5"],
  },
  {
    id: "hw2",
    title: "15.2 不等式组解集 · 课后巩固",
    level: "校",
    meta: ["3 题", "难度 基础", "已布置 3 个班", "使用 91 次"],
    tags: ["课后巩固", "易错训练"],
    action: "布置作业",
    qIds: ["q2", "q3", "q1"],
  },
  {
    id: "hw3",
    title: "一元一次不等式 · 培优拔高卷",
    level: "市",
    meta: ["4 题", "难度 提升-挑战", "使用 326 次"],
    tags: ["培优", "压轴", "含视频讲解"],
    action: "布置作业",
    hasVideo: true,
    qIds: ["q4", "q5", "q2", "q1"],
  },
]

const lessonData: ResItem[] = [
  {
    id: "lp1",
    title: "15.2 一元一次不等式组（第1课时）",
    level: "校",
    meta: ["PPT 课件", "24 页", "使用 56 次"],
    tags: ["新授课", "数轴表示", "配套学案"],
    action: "用于备课",
  },
  {
    id: "lp2",
    title: "一元一次不等式组解集规律 · 教学设计",
    level: "区",
    meta: ["教案 / 讲义", "8 页", "使用 132 次"],
    tags: ["规律梳理", "公开课"],
    action: "用于备课",
  },
  {
    id: "lp3",
    title: "第15章 单元整体教学设计",
    level: "市",
    meta: ["教案 + PPT", "42 页", "使用 410 次"],
    tags: ["大单元", "教学评一体化"],
    action: "用于备课",
  },
]

const microData: ResItem[] = [
  {
    id: "mc1",
    title: "一元一次不等式的解法",
    level: "市",
    meta: ["时长 06:12", "观看 2.3k"],
    tags: ["精讲", "解法演示"],
    action: "预览微课",
    hasVideo: true,
  },
  {
    id: "mc2",
    title: "数轴上表示不等式组的解集",
    level: "区",
    meta: ["时长 08:30", "观看 1.1k"],
    tags: ["数轴表示", "易错点"],
    action: "预览微课",
    hasVideo: true,
  },
  {
    id: "mc3",
    title: "不等式性质常见陷阱",
    level: "校",
    meta: ["时长 05:48", "观看 640"],
    tags: ["概念辨析", "纠错"],
    action: "预览微课",
    hasVideo: true,
  },
]

const premiumData: ResItem[] = [
  {
    id: "pm1",
    title: "一元一次不等式组专项训练（精品讲解包）",
    level: "市",
    meta: ["含 5 题", "5 个视频讲解", "预计 18 分钟"],
    tags: ["精品讲解", "课后巩固", "错题讲评"],
    action: "布置作业",
    hasVideo: true,
    qIds: ["q1", "q2", "q4", "q5", "q3"],
    videoCount: 5,
  },
  {
    id: "pm2",
    title: "中考一轮 · 不等式与不等式组高频考点",
    level: "市",
    meta: ["含 4 题", "4 个微课", "配套测评卷"],
    tags: ["中考复习", "高频考点", "名师讲解"],
    action: "布置作业",
    hasVideo: true,
    qIds: ["q4", "q1", "q5", "q2"],
    videoCount: 4,
  },
  {
    id: "pm3",
    title: "分层走班 · 不等式拓展提升资源库",
    level: "区",
    meta: ["含 3 题", "3 个视频", "三档分层"],
    tags: ["分层教学", "走班", "拓展提升"],
    action: "布置作业",
    hasVideo: true,
    qIds: ["q5", "q4", "q2"],
    videoCount: 3,
  },
]

const qTypeFilters: ("全部" | QType)[] = ["全部", "单选", "多选", "填空", "判断", "主观"]
const sourceFilters: ("全部" | Level)[] = ["全部", "市", "区", "校", "我"]
const diffFilters: ("全部" | Difficulty)[] = ["全部", "易", "中", "难"]

const resourceTypes = [
  { key: "题目", icon: FileText },
  { key: "作业", icon: ClipboardList },
  { key: "备课", icon: Layers },
  { key: "微课", icon: Clapperboard },
  { key: "精品", icon: Crown },
] as const

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
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"info" | "tags">("info")

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-card transition",
        selected
          ? "border-brand ring-1 ring-brand/30"
          : "border-border hover:border-brand/40 hover:shadow-sm",
      )}
    >
      <div className="p-4 sm:p-5">
        {/* 顶部元信息行 */}
        <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground">{index}</span>
          <span className="rounded bg-brand-soft px-1.5 py-0.5 font-medium text-brand-soft-foreground">
            {q.qType}
          </span>
          <SourceBadge level={q.level} />
          <span className={cn("rounded px-1.5 py-0.5 font-medium", diffStyle[q.difficulty])}>
            {q.difficulty}
          </span>
          <span className="inline-flex items-center gap-0.5 rounded bg-warn/20 px-1.5 py-0.5 font-medium text-warn-foreground">
            <PlayCircle className="size-3" />
            视频讲解
          </span>
          <span className="ml-auto hidden text-muted-foreground sm:inline">
            组卷 {q.used} · 已练 {q.students} 人
          </span>
        </div>

        {/* 题干 */}
        <div className={cn("text-[15px] leading-7 text-foreground", compact && "line-clamp-2")}>
          {q.stem}
        </div>

        {/* 选项（详情模式） */}
        {!compact && q.options && (
          <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {q.options.map((o) => (
              <div key={o.key} className="flex items-baseline gap-2 text-sm text-foreground">
                <span className="font-medium text-muted-foreground">{o.key}.</span>
                <span>{o.content}</span>
              </div>
            ))}
          </div>
        )}

        {/* 虚线分隔：题干 / 标签 */}
        <div className="my-3 border-t border-dashed border-border" />

        {/* 标签行 + 右下角两个操作 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {q.knowledge.map((k) => (
            <span
              key={k}
              className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-soft-foreground"
            >
              # {k}
            </span>
          ))}
          {!compact &&
            q.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {t}
              </span>
            ))}

          {/* 右下角统一操作：展开详情 + 加入 */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
            >
              <ChevronDown className={cn("size-3.5 transition", open && "rotate-180")} />
              展开详情
            </button>
            <button
              onClick={onToggle}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                selected
                  ? "border border-border bg-card text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                  : "bg-brand text-brand-foreground hover:opacity-90",
              )}
            >
              {selected ? (
                <X className="size-3.5" strokeWidth={2.5} />
              ) : (
                <ShoppingCart className="size-3.5" />
              )}
              {selected ? "移出" : "加入"}
            </button>
          </div>
        </div>

        {/* 展开详情：Tab 切换 */}
        {open && (
          <div className="mt-3 rounded-lg border border-border">
            <div className="flex items-center gap-1 border-b border-border px-2 pt-2">
              {[
                { key: "info" as const, label: "基本信息" },
                { key: "tags" as const, label: "系统标注" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "rounded-t-md px-3 py-1.5 text-xs font-medium transition",
                    tab === t.key
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "info" ? (
              <div className="space-y-3 p-3 text-sm leading-7">
                <div className="flex gap-2">
                  <span className="shrink-0 font-medium text-brand">【答案】</span>
                  <div>{q.answer}</div>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <span className="shrink-0 font-medium text-foreground">【解析】</span>
                  <div>{q.analysis}</div>
                </div>
                {/* 讲解视频 */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-2.5">
                  <div className="grid size-9 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
                    <PlayCircle className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {q.videoTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">讲解视频 · {q.videoDuration}</p>
                  </div>
                  <button className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-brand transition hover:bg-brand-soft">
                    播放
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 text-sm">
                <TagDimension label="知识点" items={q.knowledge} tone="brand" />
                <TagDimension label="核心素养" items={q.literacy} tone="accent" />
                <TagDimension label="认知层级" items={[q.cognitive]} tone="muted" />
                <TagDimension label="教学标签" items={q.tags} tone="muted" />
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function TagDimension({
  label,
  items,
  tone,
}: {
  label: string
  items: string[]
  tone: "brand" | "accent" | "muted"
}) {
  const cls =
    tone === "brand"
      ? "bg-brand-soft text-brand-soft-foreground"
      : tone === "accent"
        ? "bg-accent text-accent-foreground"
        : "border border-border bg-muted text-muted-foreground"
  return (
    <div className="flex gap-3">
      <span className="w-16 shrink-0 pt-0.5 text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className={cn("rounded-md px-2 py-0.5 text-[12px] font-medium", cls)}>
            {it}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------- 其他资源卡 ---------------------------- */

function ResourceCard({
  item,
  premium,
  canPreview,
  onPreview,
}: {
  item: ResItem
  premium?: boolean
  canPreview?: boolean
  onPreview?: () => void
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 transition hover:border-brand/40 hover:shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        {premium && (
          <span className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-[oklch(0.72_0.13_70)] px-1.5 py-0.5 text-[11px] font-bold text-white">
            <Crown className="size-3" />
            精品
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-foreground">{item.title}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <SourceBadge level={item.level} showLabel />
            {item.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
            {item.hasVideo && (
              <span className="inline-flex items-center gap-0.5 text-warn-foreground">
                <PlayCircle className="size-3" />
                含视频
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-border" />

      <div className="flex flex-wrap items-center gap-1.5">
        {item.tags.map((t) => (
          <span
            key={t}
            className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onPreview}
            disabled={!canPreview}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground disabled:opacity-50"
          >
            <Eye className="size-3.5" />
            {premium ? "查看试卷" : "预览"}
          </button>
          <button className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground transition hover:opacity-90">
            <ClipboardList className="size-3.5" />
            {item.action}
          </button>
        </div>
      </div>
    </article>
  )
}

/* ---------------------------- 试卷预览二级页 ---------------------------- */

function PaperDetail({
  paper,
  premium,
  onBack,
}: {
  paper: ResItem
  premium?: boolean
  onBack: () => void
}) {
  const papered = (paper.qIds ?? []).map((id) => questions.find((q) => q.id === id)!).filter(Boolean)

  /* 按题型分大题 */
  const typeOrder: QType[] = ["单选", "多选", "填空", "判断", "主观"]
  const typeLabel: Record<QType, string> = {
    单选: "一、单项选择题",
    多选: "二、多项选择题",
    填空: "三、填空题",
    判断: "四、判断题",
    主观: "五、主观题",
  }
  const grouped = typeOrder
    .map((t) => ({ type: t, items: papered.filter((q) => q.qType === t) }))
    .filter((g) => g.items.length)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {/* 二级页头部 */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/85 px-5 py-3 backdrop-blur">
        <button
          onClick={onBack}
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          返回资源列表
        </button>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {premium && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.72_0.13_70)] px-1.5 py-0.5 text-[11px] font-bold text-white">
                  <Crown className="size-3" />
                  精品
                </span>
              )}
              <h1 className="truncate text-lg font-bold text-foreground">{paper.title}</h1>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <SourceBadge level={paper.level} showLabel />
              {paper.meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
          <button className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90">
            <ClipboardList className="size-4" />
            布置作业
          </button>
        </div>
      </div>

      {/* 题目列表（含每题讲解视频） */}
      <div className="mx-auto max-w-4xl px-5 py-5">
        {premium && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-[oklch(0.97_0.03_75)] px-3 py-2 text-xs text-[oklch(0.45_0.09_60)]">
            <Crown className="size-3.5" />
            本精品试卷共 {papered.length} 题，含 {paper.videoCount ?? papered.length} 个名师讲解视频，已开通学校可直接布置或查看讲解。
          </div>
        )}
        <div className="flex flex-col gap-5">
          {grouped.map((g) => (
            <section key={g.type}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                {typeLabel[g.type]}
                <span className="rounded-full bg-brand-soft px-1.5 text-[11px] font-medium text-brand-soft-foreground">
                  {g.items.length} 题
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {g.items.map((q, i) => (
                  <article key={q.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-muted-foreground">{i + 1}</span>
                      <SourceBadge level={q.level} />
                      <span className={cn("rounded px-1.5 py-0.5 font-medium", diffStyle[q.difficulty])}>
                        {q.difficulty}
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded bg-warn/20 px-1.5 py-0.5 font-medium text-warn-foreground">
                        <PlayCircle className="size-3" />
                        视频讲解
                      </span>
                    </div>
                    <div className="text-[15px] leading-7 text-foreground">{q.stem}</div>
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
                    <div className="my-3 border-t border-dashed border-border" />
                    <div className="flex items-start gap-2 text-sm leading-7">
                      <span className="shrink-0 font-medium text-brand">【答案】</span>
                      <div>{q.answer}</div>
                    </div>
                    {/* 讲解视频 */}
                    <div className="mt-3 flex items-center gap-3 rounded-lg bg-muted/60 p-2.5">
                      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
                        <PlayCircle className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">{q.videoTitle}</p>
                        <p className="text-xs text-muted-foreground">讲解视频 · {q.videoDuration}</p>
                      </div>
                      <button className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-brand transition hover:bg-brand-soft">
                        播放
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- 主组件 ---------------------------- */

export function ResourceWorkbench() {
  const [resourceType, setResourceType] = useState<string>("题目")
  const [qType, setQType] = useState<"全部" | QType>("全部")
  const [source, setSource] = useState<"全部" | Level>("全部")
  const [diff, setDiff] = useState<"全部" | Difficulty>("全部")
  const [compact, setCompact] = useState(false)
  const [moreFilters, setMoreFilters] = useState(false)
  const [selected, setSelected] = useState<string[]>(["q1"])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [previewPaper, setPreviewPaper] = useState<ResItem | null>(null)

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

  const cartItems = questions.filter((q) => selected.includes(q.id))
  const isQuestion = resourceType === "题目"
  const isPremium = resourceType === "精品"

  const otherData =
    resourceType === "作业"
      ? homeworkData
      : resourceType === "备课"
        ? lessonData
        : resourceType === "微课"
          ? microData
          : premiumData

  return (
    <div className="relative flex h-full min-h-0">
      {/* 左侧目录栏 */}
      <aside
        className={cn(
          "hidden shrink-0 overflow-y-auto border-r border-border bg-card transition-all lg:block",
          sidebarOpen ? "w-64 p-3" : "w-0 overflow-hidden p-0",
        )}
      >
        {sidebarOpen && <ChapterSidebar onSwitchTextbook={() => setSwitcherOpen(true)} />}
      </aside>

      {/* 主区域 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {previewPaper ? (
          <PaperDetail
            paper={previewPaper}
            premium={isPremium}
            onBack={() => setPreviewPaper(null)}
          />
        ) : (
          <>
        {/* 工具栏（无面包屑） */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-background/85 px-5 py-3 backdrop-blur">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "收起目录" : "展开目录"}
            className="hidden size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:text-foreground lg:inline-flex"
          >
            {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
          </button>

          {/* 资源类型分段 */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
            {resourceTypes.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setResourceType(t.key)
                  setPreviewPaper(null)
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition",
                  resourceType === t.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                  t.key === "精品" && resourceType !== "精品" && "text-[oklch(0.6_0.13_55)]",
                )}
              >
                <t.icon
                  className={cn(
                    "size-3.5",
                    t.key === "精品" && "text-[oklch(0.66_0.14_65)]",
                  )}
                />
                {t.key}
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

        {/* 精品资源：B 端可见性提示 */}
        {isPremium && (
          <div className="flex items-center gap-2 border-b border-border bg-[oklch(0.97_0.03_75)] px-5 py-2 text-xs text-[oklch(0.45_0.09_60)]">
            <Lock className="size-3.5" />
            精品资源为付费内容，仅对已开通的大客户学校教师展示，可直接加入题篮使用。
          </div>
        )}

        {/* 筛选条：默认露出来源四级 + 展开更多 */}
        <div className="flex flex-col gap-2 border-b border-border px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <FilterGroup
              label="来源"
              items={sourceFilters}
              active={source}
              onChange={(v) => setSource(v as typeof source)}
              renderItem={(it) => (it === "全部" ? "全部" : `${it}级`.replace("我级", "我的"))}
            />
            <button
              onClick={() => setMoreFilters((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-muted-foreground transition hover:text-foreground"
            >
              更多筛选
              <ChevronDown className={cn("size-3.5 transition", moreFilters && "rotate-180")} />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                共{" "}
                <span className="font-semibold text-foreground">
                  {isQuestion ? filtered.length : otherData.length}
                </span>{" "}
                {isQuestion ? "题" : "条"}
              </span>
              {isQuestion && (
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
              )}
            </div>
          </div>

          {moreFilters && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-2.5">
              {isQuestion && (
                <FilterGroup
                  label="题型"
                  items={qTypeFilters}
                  active={qType}
                  onChange={(v) => setQType(v as typeof qType)}
                />
              )}
              <FilterGroup
                label="难度"
                items={diffFilters}
                active={diff}
                onChange={(v) => setDiff(v as typeof diff)}
              />
            </div>
          )}
        </div>

        {/* 列表（核心阅读区，可滚动） */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 pb-24">
          {isQuestion ? (
            <div className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
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
            <div className="flex flex-col gap-3">
              {otherData.map((item) => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  premium={isPremium}
                  canPreview={resourceType === "作业" || isPremium}
                  onPreview={() => setPreviewPaper(item)}
                />
              ))}
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* 右侧悬浮题篮球 */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-8 right-6 z-30 flex flex-col items-center gap-0.5 rounded-2xl bg-brand px-3.5 py-3 text-brand-foreground shadow-lg shadow-brand/30 transition hover:opacity-95"
      >
        <ShoppingCart className="size-5" />
        <span className="text-[11px] font-medium leading-none">题篮</span>
        {selected.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-background bg-hard px-1 text-[11px] font-bold text-white tabular-nums">
            {selected.length}
          </span>
        )}
      </button>

      {/* 题篮抽屉（按大题归类） */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onRemove={(id) => toggle(id)}
        onClear={() => setSelected([])}
      />

      {/* 教材切换弹窗 */}
      <TextbookSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </div>
  )
}

/* ---------------------------- 子组件 ---------------------------- */

function FilterGroup<T extends string>({
  label,
  items,
  active,
  onChange,
  renderItem,
}: {
  label: string
  items: readonly T[]
  active: T
  onChange: (v: T) => void
  renderItem?: (v: T) => string
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
            {renderItem ? renderItem(it) : it}
          </button>
        ))}
      </div>
    </div>
  )
}

function CartDrawer({
  open,
  items,
  onClose,
  onRemove,
  onClear,
}: {
  open: boolean
  items: Question[]
  onClose: () => void
  onRemove: (id: string) => void
  onClear: () => void
}) {
  if (!open) return null

  /* 按题型归类（大题），题为小题 */
  const typeOrder: QType[] = ["单选", "多选", "填空", "判断", "主观"]
  const typeLabel: Record<QType, string> = {
    单选: "一、单项选择题",
    多选: "二、多项选择题",
    填空: "三、填空题",
    判断: "四、判断题",
    主观: "五、主观题",
  }
  const groups = items.reduce<Record<string, Question[]>>((acc, q) => {
    ;(acc[q.qType] ||= []).push(q)
    return acc
  }, {})
  const orderedGroups = typeOrder.filter((t) => groups[t]?.length)

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} aria-label="关闭" />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <ShoppingCart className="size-4 text-brand" />
            题篮 · {items.length} 题
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <ShoppingCart className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">题篮还是空的</p>
              <p className="max-w-[16rem] text-xs text-muted-foreground/80">
                浏览题目时点卡片右下角「加入」，把题加进来，再统一组卷或布置。
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orderedGroups.map((t) => (
                <div key={t}>
                  {/* 大题（题型）分组标题 */}
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-foreground">{typeLabel[t]}</span>
                    <span className="rounded-full bg-brand-soft px-1.5 text-[11px] font-medium text-brand-soft-foreground">
                      {groups[t].length} 小题
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {groups[t].map((q, i) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-2 rounded-lg border border-border p-3"
                      >
                        <span className="mt-0.5 text-xs font-semibold text-muted-foreground">
                          {i + 1}.
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">{q.short}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                            <SourceBadge level={q.level} />
                            <span
                              className={cn("rounded px-1.5 py-0.5 font-medium", diffStyle[q.difficulty])}
                            >
                              {q.difficulty}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemove(q.id)}
                          aria-label="移出"
                          className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          {items.length > 0 && (
            <button
              onClick={onClear}
              className="mb-3 text-xs text-muted-foreground transition hover:text-destructive"
            >
              清空题篮
            </button>
          )}
          <button
            disabled={items.length === 0}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <ClipboardList className="size-4" />
            布置作业
          </button>
        </div>
      </div>
    </div>
  )
}
