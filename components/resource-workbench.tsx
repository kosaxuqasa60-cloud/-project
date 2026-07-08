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
  LayoutGrid,
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
  MoreHorizontal,
  Pencil,
  Copy,
  Share2,
  ClipboardCheck,
  Calendar,
  User,
  FolderTree,
  Download,
  Upload,
  Presentation,
  FileType2,
  Play,
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChapterSidebar } from "@/components/chapter-sidebar"
import { SourceBadge, type Level } from "@/components/source-badge"
import { Math } from "@/components/math"
import { TextbookSwitcher } from "@/components/textbook-switcher"
import { ExerciseComposer } from "@/components/exercise-composer"

/* ---------------------------- 数据 ---------------------------- */

export type QType = "单选" | "多选" | "填空" | "判断" | "主观"
export type Difficulty = "易" | "中" | "难"

export type Question = {
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

export const questions: Question[] = [
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
    knowledge: ["一元一次不���式", "实际应用"],
    literacy: ["数学建模", "数学运算"],
    cognitive: "应用",
    tags: ["情景应用", "校本改编"],
    short: "知识竞赛得分不低于79分",
    stem: (
      <>
        某次知识竞赛共 20 题��答对一题得 5 分，答错或不答扣 2 分。小明要得分不低于 79
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
type ResSource = "组卷" | "上传" | "共享"
type FileKind = "PPT" | "Word" | "PDF" | "Excel"
type MicroCategory = "同步讲解" | "专题突破" | "复习巩固" | "考点精析" | "其他"
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
  /* 作业列表展示字段 */
  source?: ResSource
  chapter?: string
  creator?: string
  createdAt?: string
  /* 备课 / 微课 通用展示字段 */
  author?: string
  uploadedAt?: string
  previewCount?: number
  useCount?: number
  pages?: number
  fileKind?: FileKind
  /* 微课字段 */
  cover?: string
  duration?: string
  category?: MicroCategory
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
    source: "组卷",
    chapter: "第15章 一元一次不等式",
    creator: "张伟",
    createdAt: "2026-06-28",
  },
  {
    id: "hw2",
    title: "15.2 不等式组解集 · 课后巩固",
    level: "校",
    meta: ["3 题", "难度 基础", "已布置 3 个班", "使用 91 次"],
    tags: ["课后巩固", "易错训练"],
    action: "布置作业",
    qIds: ["q2", "q3", "q1"],
    source: "上传",
    chapter: "15.2 一元一次不等式组",
    creator: "李娜",
    createdAt: "2026-07-02",
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
    source: "共享",
    chapter: "第15章 一元一次不等式",
    creator: "教研组",
    createdAt: "2026-05-19",
  },
]

const lessonData: ResItem[] = [
  {
    id: "lp1",
    title: "15.2 一元一次不等式组（第1课时）.pptx",
    level: "校",
    meta: [],
    tags: [],
    action: "",
    fileKind: "PPT",
    author: "张伟",
    uploadedAt: "2026-06-28",
    previewCount: 0,
    useCount: 2,
    pages: 24,
  },
  {
    id: "lp2",
    title: "一元一次不等式组解集规律 · 教学设计.docx",
    level: "区",
    meta: [],
    tags: [],
    action: "",
    fileKind: "Word",
    author: "李娜",
    uploadedAt: "2026-07-02",
    previewCount: 18,
    useCount: 6,
    pages: 8,
  },
  {
    id: "lp3",
    title: "第15章 单元整体教学设计.pdf",
    level: "市",
    meta: [],
    tags: [],
    action: "",
    fileKind: "PDF",
    author: "教研组",
    uploadedAt: "2026-05-19",
    previewCount: 132,
    useCount: 41,
    pages: 42,
  },
]

const microData: ResItem[] = [
  {
    id: "mc1",
    title: "一元一次不等式的解法",
    level: "市",
    meta: [],
    tags: [],
    action: "",
    hasVideo: true,
    cover: "/micro/cover-1.png",
    duration: "06:12",
    category: "同步讲解",
    author: "张伟",
    uploadedAt: "2026-06-20",
    previewCount: 0,
    useCount: 12,
  },
  {
    id: "mc2",
    title: "数轴上表示不等式组的解集",
    level: "区",
    meta: [],
    tags: [],
    action: "",
    hasVideo: true,
    cover: "/micro/cover-2.png",
    duration: "08:30",
    category: "专题突破",
    author: "李娜",
    uploadedAt: "2026-06-24",
    previewCount: 8,
    useCount: 5,
  },
  {
    id: "mc3",
    title: "不等式性质常见陷阱",
    level: "校",
    meta: [],
    tags: [],
    action: "",
    hasVideo: true,
    cover: "/micro/cover-3.png",
    duration: "05:48",
    category: "考点精析",
    author: "王芳",
    uploadedAt: "2026-06-30",
    previewCount: 3,
    useCount: 2,
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
const microCatFilters: ("全部" | MicroCategory)[] = ["全部", "同步讲解", "专题突破", "复习巩固", "考点精析", "其他"]

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

        {/* 标��行 + 右下角两个操作 */}
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
          <div className="mt-3">
            <QuestionDetailPanel q={q} tab={tab} onTab={setTab} />
          </div>
        )}
      </div>
    </article>
  )
}

/* 单题详情面板（基本信息 / 系统标注），题库与作业预览共用 */
function QuestionDetailPanel({
  q,
  tab,
  onTab,
}: {
  q: Question
  tab: "info" | "tags"
  onTab: (t: "info" | "tags") => void
}) {
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center gap-1 border-b border-border px-2 pt-2">
        {[
          { key: "info" as const, label: "基本信息" },
          { key: "tags" as const, label: "系统标注" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
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
              <p className="truncate text-[13px] font-medium text-foreground">{q.videoTitle}</p>
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

/* ---------------------------- 作业卡片 ---------------------------- */

const sourceStyle: Record<ResSource, string> = {
  组卷: "bg-brand-soft text-brand-soft-foreground",
  上传: "bg-accent text-accent-foreground",
  共享: "bg-warn/20 text-warn-foreground",
}

function HomeworkCard({ item, onPreview }: { item: ResItem; onPreview: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const qCount = item.qIds?.length ?? 0

  const metaItems: { icon: typeof User; label: string; value: string }[] = [
    { icon: Layers, label: "题目数量", value: `${qCount} 题` },
    { icon: FolderTree, label: "所属章节", value: item.chapter ?? "—" },
    { icon: User, label: "创作者", value: item.creator ?? "—" },
    { icon: Calendar, label: "创建时间", value: item.createdAt ?? "—" },
  ]

  const menu: { icon: typeof Trash2; label: string; danger?: boolean }[] = [
    { icon: Copy, label: "复制" },
    { icon: Share2, label: "共享" },
    { icon: ClipboardCheck, label: "评分标准绑定" },
    { icon: Trash2, label: "删除", danger: true },
  ]

  return (
    <article className="rounded-xl border border-border bg-card p-4 transition hover:border-brand/40 hover:shadow-sm sm:p-5">
      {/* 标题 + 级别 + 来源 */}
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 text-[15px] font-semibold text-foreground">{item.title}</h3>
        {item.source && (
          <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium", sourceStyle[item.source])}>
            {item.source}
          </span>
        )}
      </div>

      {/* 元信息：级别 / 题目数量 / 所属章节 / 创作者 / 创建时间 */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <SourceBadge level={item.level} showLabel />
        </span>
        {metaItems.map((m) => (
          <span key={m.label} className="inline-flex items-center gap-1">
            <m.icon className="size-3.5 text-muted-foreground/70" />
            <span className="text-muted-foreground/70">{m.label}</span>
            <span className="font-medium text-foreground">{m.value}</span>
          </span>
        ))}
      </div>

      <div className="my-3 border-t border-dashed border-border" />

      {/* 操作：预览 / 布置 / 编辑 / 更多 */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onPreview}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
        >
          <Eye className="size-3.5" />
          预览
        </button>
        <button className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground">
          <Pencil className="size-3.5" />
          编辑
        </button>
        <button className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground transition hover:opacity-90">
          <ClipboardList className="size-3.5" />
          布置
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="更多操作"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
          >
            <MoreHorizontal className="size-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
                {menu.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition hover:bg-muted",
                      m.danger ? "text-destructive hover:bg-destructive/10" : "text-foreground",
                    )}
                  >
                    <m.icon className="size-3.5" />
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

/* ---------------------------- 备课 / 微课 通用 ---------------------------- */

const fileKindStyle: Record<FileKind, { bg: string; label: string; icon: typeof FileText }> = {
  PPT: { bg: "bg-[oklch(0.62_0.16_38)]", label: "PPT", icon: Presentation },
  Word: { bg: "bg-[oklch(0.5_0.13_255)]", label: "DOC", icon: FileText },
  PDF: { bg: "bg-[oklch(0.55_0.18_25)]", label: "PDF", icon: FileType2 },
  Excel: { bg: "bg-[oklch(0.52_0.13_150)]", label: "XLS", icon: FileText },
}

const microCatStyle: Record<MicroCategory, string> = {
  同步讲解: "bg-brand-soft text-brand-soft-foreground",
  专题突破: "bg-accent text-accent-foreground",
  复习巩固: "bg-warn/20 text-warn-foreground",
  考点精析: "bg-[oklch(0.93_0.03_255)] text-[oklch(0.4_0.13_255)]",
  其他: "bg-muted text-muted-foreground",
}

/* 共用操作：预览 / 编辑 / 下载 / 共享 / 删除 */
function ResourceActions({ onPreview, compact }: { onPreview?: () => void; compact?: boolean }) {
  const actions: { icon: typeof Eye; label: string; onClick?: () => void; danger?: boolean }[] = [
    { icon: Eye, label: "预览", onClick: onPreview },
    { icon: Pencil, label: "编辑" },
    { icon: Download, label: "下载" },
    { icon: Share2, label: "共享" },
    { icon: Trash2, label: "删除", danger: true },
  ]
  return (
    <div className={cn("flex items-center", compact ? "gap-1" : "gap-1.5")}>
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          title={a.label}
          aria-label={a.label}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-border transition hover:border-brand/40 hover:text-foreground",
            compact ? "size-8" : "gap-1 px-2.5 py-1.5 text-xs font-medium",
            a.danger ? "text-muted-foreground hover:border-destructive/40 hover:text-destructive" : "text-muted-foreground",
          )}
        >
          <a.icon className="size-3.5" />
          {!compact && a.label}
        </button>
      ))}
    </div>
  )
}

/* 备课：文件列表行 */
function PrepCard({ item, onPreview }: { item: ResItem; onPreview: () => void }) {
  const fk = fileKindStyle[item.fileKind ?? "Word"]
  return (
    <article className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-brand/40 hover:shadow-sm">
      {/* 文件类型图标 */}
      <div className={cn("grid size-12 shrink-0 place-items-center rounded-lg text-white", fk.bg)}>
        <fk.icon className="size-6" />
      </div>

      {/* 主体信息 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-foreground">{item.title}</h3>
          <SourceBadge level={item.level} showLabel />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5 text-muted-foreground/70" />
            {item.author}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5 text-muted-foreground/70" />
            {item.uploadedAt}
          </span>
          <span>预览次数：<span className="font-medium text-foreground">{item.previewCount}</span></span>
          <span>使用次数：<span className="font-medium text-foreground">{item.useCount}</span></span>
          <span>共 <span className="font-medium text-foreground">{item.pages}</span> 页</span>
        </div>
      </div>

      {/* 操作 */}
      <div className="shrink-0">
        <ResourceActions onPreview={onPreview} compact />
      </div>
    </article>
  )
}

/* 微课：封面卡片 */
function MicroCard({ item, onPreview }: { item: ResItem; onPreview: () => void }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-brand/40 hover:shadow-sm">
      {/* 封面 */}
      <button onClick={onPreview} className="relative aspect-video w-full overflow-hidden bg-muted">
        {item.cover && (
          <Image
            src={item.cover || "/placeholder.svg"}
            alt={item.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        {/* 播放遮罩 */}
        <span className="absolute inset-0 grid place-items-center bg-foreground/0 transition group-hover:bg-foreground/20">
          <span className="grid size-11 place-items-center rounded-full bg-card/90 text-brand opacity-0 shadow-lg transition group-hover:opacity-100">
            <Play className="size-5 translate-x-0.5 fill-current" />
          </span>
        </span>
        {/* 分类 + 级别 */}
        <span className="absolute left-2 top-2 flex items-center gap-1.5">
          {item.category && (
            <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-medium", microCatStyle[item.category])}>
              {item.category}
            </span>
          )}
        </span>
        <span className="absolute right-2 top-2">
          <SourceBadge level={item.level} />
        </span>
        {/* 时长 */}
        {item.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-foreground/75 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-background">
            {item.duration}
          </span>
        )}
      </button>

      {/* 信息 */}
      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">{item.title}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <User className="size-3 text-muted-foreground/70" />
            {item.author}
          </span>
          <span>预览 {item.previewCount}</span>
          <span>使用 {item.useCount}</span>
        </div>
        <div className="mt-2 border-t border-dashed border-border pt-2">
          <ResourceActions onPreview={onPreview} compact />
        </div>
      </div>
    </article>
  )
}

/* 微课：列表行视图 */
function MicroRow({ item, onPreview }: { item: ResItem; onPreview: () => void }) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition hover:border-brand/40 hover:shadow-sm">
      {/* 缩略图 */}
      <button
        onClick={onPreview}
        className="group relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {item.cover && (
          <Image
            src={item.cover || "/placeholder.svg"}
            alt={item.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="160px"
          />
        )}
        <span className="absolute inset-0 grid place-items-center bg-foreground/0 transition group-hover:bg-foreground/20">
          <span className="grid size-9 place-items-center rounded-full bg-card/90 text-brand opacity-0 shadow-lg transition group-hover:opacity-100">
            <Play className="size-4 translate-x-0.5 fill-current" />
          </span>
        </span>
        {item.duration && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-foreground/75 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-background">
            {item.duration}
          </span>
        )}
      </button>

      {/* 主体信息 */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-foreground">{item.title}</h3>
          {item.category && (
            <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-medium", microCatStyle[item.category])}>
              {item.category}
            </span>
          )}
          <SourceBadge level={item.level} showLabel />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5 text-muted-foreground/70" />
            {item.author}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5 text-muted-foreground/70" />
            {item.uploadedAt}
          </span>
          <span>预览次数：<span className="font-medium text-foreground">{item.previewCount}</span></span>
          <span>使用次数：<span className="font-medium text-foreground">{item.useCount}</span></span>
        </div>
      </div>

      {/* 操作 */}
      <div className="shrink-0">
        <ResourceActions onPreview={onPreview} compact />
      </div>
    </article>
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
  selected,
  onToggle,
  onBack,
}: {
  paper: ResItem
  premium?: boolean
  selected: string[]
  onToggle: (id: string) => void
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
                  <PaperQuestionCard
                    key={q.id}
                    q={q}
                    index={i + 1}
                    selected={selected.includes(q.id)}
                    onToggle={() => onToggle(q.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

/* 试卷预览中的单题卡：题干可直接看，展开后与题库单题一致（基本信息 / 系统标注），并可加入题篮 */
function PaperQuestionCard({
  q,
  index,
  selected,
  onToggle,
}: {
  q: Question
  index: number
  selected: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"info" | "tags">("info")

  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-4 transition sm:p-5",
        selected ? "border-brand ring-1 ring-brand/30" : "border-border",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-muted-foreground">{index}</span>
        <span className="rounded bg-brand-soft px-1.5 py-0.5 font-medium text-brand-soft-foreground">{q.qType}</span>
        <SourceBadge level={q.level} />
        <span className={cn("rounded px-1.5 py-0.5 font-medium", diffStyle[q.difficulty])}>{q.difficulty}</span>
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

      <div className="flex items-center justify-end gap-2">
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
          {selected ? <X className="size-3.5" strokeWidth={2.5} /> : <ShoppingCart className="size-3.5" />}
          {selected ? "移出" : "加入"}
        </button>
      </div>

      {open && (
        <div className="mt-3">
          <QuestionDetailPanel q={q} tab={tab} onTab={setTab} />
        </div>
      )}
    </article>
  )
}

/* ---------------------------- 主组件 ---------------------------- */

export function ResourceWorkbench() {
  const [resourceType, setResourceType] = useState<string>("题目")
  const [qType, setQType] = useState<"全部" | QType>("全部")
  const [source, setSource] = useState<"全部" | Level>("全部")
  const [diff, setDiff] = useState<"全部" | Difficulty>("全部")
  const [microCat, setMicroCat] = useState<"全部" | MicroCategory>("全部")
  const [microView, setMicroView] = useState<"grid" | "list">("grid")
  const [compact, setCompact] = useState(false)
  const [moreFilters, setMoreFilters] = useState(false)
  const [selected, setSelected] = useState<string[]>(["q1"])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [previewPaper, setPreviewPaper] = useState<ResItem | null>(null)
  const [composing, setComposing] = useState(false)
  const [uploadKind, setUploadKind] = useState<"备课" | "微课" | null>(null)

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
          ? microData.filter(
              (m) =>
                (source === "全部" || m.level === source) &&
                (microCat === "全部" || m.category === microCat),
            )
          : premiumData

  /* 组卷 / 生成练习��全屏接管，隐藏应用左侧导航与顶栏 */
  if (composing) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <ExerciseComposer
          items={cartItems}
          onBack={() => setComposing(false)}
          onRemove={(id) => toggle(id)}
        />
      </div>
    )
  }

  /* 预览二级页：全屏接管，隐藏应用左侧导航与章节目录 */
  if (previewPaper) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <PaperDetail
          paper={previewPaper}
          premium={isPremium}
          selected={selected}
          onToggle={toggle}
          onBack={() => setPreviewPaper(null)}
        />
        {/* 预览页也保留题篮入口 */}
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
        <CartDrawer
          open={cartOpen}
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onRemove={(id) => toggle(id)}
          onClear={() => setSelected([])}
          onGenerate={() => {
            setCartOpen(false)
            setPreviewPaper(null)
            setComposing(true)
          }}
        />
      </div>
    )
  }

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

          {resourceType === "题目" && (
            <Link
              href="/new-question"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
            >
              <Plus className="size-4" />
              新增题目
            </Link>
          )}
          {resourceType === "备课" && (
            <button
              onClick={() => setUploadKind("备课")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
            >
              <Upload className="size-4" />
              上传文件
            </button>
          )}
          {resourceType === "微课" && (
            <button
              onClick={() => setUploadKind("微课")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
            >
              <Upload className="size-4" />
              上传微课
            </button>
          )}
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
            {resourceType === "微课" && (
              <FilterGroup
                label="类型"
                items={microCatFilters}
                active={microCat}
                onChange={(v) => setMicroCat(v as typeof microCat)}
              />
            )}
            {resourceType !== "作业" && resourceType !== "微课" && (
              <button
                onClick={() => setMoreFilters((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-muted-foreground transition hover:text-foreground"
              >
                更多筛选
                <ChevronDown className={cn("size-3.5 transition", moreFilters && "rotate-180")} />
              </button>
            )}

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
              {resourceType === "微课" && (
                <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
                  <button
                    onClick={() => setMicroView("grid")}
                    className={cn(
                      "rounded-md p-1.5 transition",
                      microView === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                    )}
                    aria-label="网格视图"
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    onClick={() => setMicroView("list")}
                    className={cn(
                      "rounded-md p-1.5 transition",
                      microView === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                    )}
                    aria-label="列表视图"
                  >
                    <Rows3 className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {moreFilters && resourceType !== "作业" && resourceType !== "微课" && (
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
          ) : resourceType === "微课" ? (
            microView === "grid" ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {otherData.map((item) => (
                  <MicroCard key={item.id} item={item} onPreview={() => {}} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {otherData.map((item) => (
                  <MicroRow key={item.id} item={item} onPreview={() => {}} />
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-3">
              {resourceType === "作业"
                ? otherData.map((item) => (
                    <HomeworkCard key={item.id} item={item} onPreview={() => setPreviewPaper(item)} />
                  ))
                : resourceType === "备课"
                  ? otherData.map((item) => (
                      <PrepCard key={item.id} item={item} onPreview={() => {}} />
                    ))
                  : otherData.map((item) => (
                      <ResourceCard
                        key={item.id}
                        item={item}
                        premium={isPremium}
                        canPreview={isPremium}
                        onPreview={() => setPreviewPaper(item)}
                      />
                    ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧悬浮题篮球（组卷时隐藏，避免与操作栏重叠） */}
      <button
        onClick={() => setCartOpen(true)}
        className={cn(
          "fixed bottom-8 right-6 z-30 flex flex-col items-center gap-0.5 rounded-2xl bg-brand px-3.5 py-3 text-brand-foreground shadow-lg shadow-brand/30 transition hover:opacity-95",
          composing && "hidden",
        )}
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
        onGenerate={() => {
          setCartOpen(false)
          setPreviewPaper(null)
          setComposing(true)
        }}
      />

      {/* 教���切换弹窗 */}
      <TextbookSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />

      {/* 上传弹窗（备课文件 / 微课） */}
      {uploadKind && <UploadModal kind={uploadKind} onClose={() => setUploadKind(null)} />}
    </div>
  )
}

/* ---------------------------- 上传弹窗 ---------------------------- */

const microCategories: MicroCategory[] = ["同步讲解", "专题突破", "复习巩固", "考点精析", "其他"]
const levelOptions: Level[] = ["市", "区", "校", "我"]

function UploadModal({ kind, onClose }: { kind: "备课" | "微课"; onClose: () => void }) {
  const isMicro = kind === "微课"
  const [fileName, setFileName] = useState("")
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [cat, setCat] = useState<MicroCategory>("同步讲解")
  const [level, setLevel] = useState<Level>("校")
  const [coverName, setCoverName] = useState("")

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* 头 */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="text-base font-bold text-foreground">{isMicro ? "上传微课" : "上传文件"}</h3>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 表单 */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {/* 上传文件 */}
          <Field label="上传文件" required>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center transition hover:border-brand/50 hover:bg-brand-soft/40">
              <Upload className="size-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {fileName ? (
                  <span className="font-medium text-foreground">{fileName}</span>
                ) : (
                  <>
                    点击选择或拖拽文件到此处
                    <br />
                    <span className="text-xs">
                      {isMicro ? "支持 MP4 / MOV，单个不超过 500MB" : "支持 PPT / Word / PDF / Excel"}
                    </span>
                  </>
                )}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          </Field>

          {isMicro && (
            <>
              {/* 微课名称 */}
              <Field label="微课名称" required>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入微课名称"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </Field>

              {/* 封面 */}
              <Field label="封面">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-input bg-card px-3 py-2.5 transition hover:border-brand/50">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                    <Image_ />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {coverName ? (
                      <span className="font-medium text-foreground">{coverName}</span>
                    ) : (
                      "上传封面图（建议 16:9），不上传则自动截取视频首帧"
                    )}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setCoverName(e.target.files?.[0]?.name ?? "")}
                  />
                </label>
              </Field>

              {/* 微课分类 */}
              <Field label="微课分类" required>
                <div className="flex flex-wrap gap-2">
                  {microCategories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                        cat === c
                          ? "border-brand bg-brand-soft text-brand-soft-foreground"
                          : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>

              {/* 描述 */}
              <Field label="描述">
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  placeholder="简要描述微课内容、适用场景等"
                  className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </Field>
            </>
          )}

          {/* 级别 */}
          <Field label="级别">
            <div className="flex flex-wrap gap-2">
              {levelOptions.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                    level === l
                      ? "border-brand bg-brand-soft text-brand-soft-foreground"
                      : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                >
                  {l === "我" ? "我的" : `${l}级`}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* 底部 */}
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
          >
            确认上传
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}

/* 小图标：避免与 next/image 的 Image 命名冲突 */
function Image_() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
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
  onGenerate,
}: {
  open: boolean
  items: Question[]
  onClose: () => void
  onRemove: (id: string) => void
  onClear: () => void
  onGenerate: () => void
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
            onClick={onGenerate}
            disabled={items.length === 0}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <ClipboardList className="size-4" />
            生成练习
          </button>
        </div>
      </div>
    </div>
  )
}
