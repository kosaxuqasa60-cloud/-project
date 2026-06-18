"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  FileQuestion,
  ClipboardList,
  Presentation,
  Video,
  Plus,
  ChevronRight,
  Eye,
  ShoppingBasket,
  Send,
  Pencil,
  MoreHorizontal,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChapterSidebar } from "@/components/chapter-sidebar"
import { SourceBadge, type Level } from "@/components/source-badge"

const taskCards = [
  {
    title: "找题目",
    desc: "按章节、知识点、题型快速组题",
    icon: FileQuestion,
    type: "题目",
  },
  { title: "找作业", desc: "复用校本 / 区市作业", icon: ClipboardList, type: "作业" },
  { title: "找课件", desc: "备课资料、PPT、讲义", icon: Presentation, type: "备课" },
  { title: "找微课", desc: "视频讲解与课堂导入", icon: Video, type: "微课" },
]

const typeTabs = ["推荐", "题目", "作业", "备课", "微课", "精品讲解"]

const sourceFilters = ["全部来源", "市级", "区级", "校本", "我的"]
const attrFilters = ["含视频讲解", "可直接布置", "可编辑"]

type Resource = {
  id: string
  title: string
  kind: "题目" | "作业" | "备课" | "微课" | "精品讲解"
  level: Level
  meta: string
  used: number
  difficulty: string
  tags: string[]
  primaryAction: "加入题篮" | "布置作业" | "预览"
  hasVideo?: boolean
  editable?: boolean
}

const resources: Resource[] = [
  {
    id: "r1",
    title: "一元一次不等式组专项训练",
    kind: "精品讲解",
    level: "市",
    meta: "12题 · 含12个视频讲解",
    used: 326,
    difficulty: "中等",
    tags: ["课后巩固", "错题讲评", "不等号变向", "预计18分钟"],
    primaryAction: "加入题篮",
    hasVideo: true,
  },
  {
    id: "r2",
    title: "不等式组解集规律梳理",
    kind: "题目",
    level: "校",
    meta: "4题 · 含解析",
    used: 91,
    difficulty: "基础",
    tags: ["课堂讲解", "基础概念", "数轴表示"],
    primaryAction: "加入题篮",
    editable: true,
  },
  {
    id: "r3",
    title: "第15章 单元复习作业",
    kind: "作业",
    level: "区",
    meta: "20题 · 可直接布置",
    used: 218,
    difficulty: "基础-提升",
    tags: ["单元复习", "分层练习", "点阵笔适配"],
    primaryAction: "布置作业",
    editable: true,
  },
  {
    id: "r4",
    title: "15.2 一元一次不等式组 · 精讲课件",
    kind: "备课",
    level: "市",
    meta: "PPT · 24页",
    used: 142,
    difficulty: "通用",
    tags: ["新授课", "情景导入", "数轴动画"],
    primaryAction: "预览",
  },
  {
    id: "r5",
    title: "解集在数轴上的表示（微课）",
    kind: "微课",
    level: "校",
    meta: "视频 · 6分32秒",
    used: 57,
    difficulty: "基础",
    tags: ["概念讲解", "易错点", "可课堂播放"],
    primaryAction: "预览",
    hasVideo: true,
  },
]

const kindStyles: Record<Resource["kind"], string> = {
  题目: "bg-brand-soft text-brand-soft-foreground",
  作业: "bg-brand-soft text-brand-soft-foreground",
  备课: "bg-brand-soft text-brand-soft-foreground",
  微课: "bg-brand-soft text-brand-soft-foreground",
  精品讲解: "bg-warn/30 text-warn-foreground",
}

const actionIcon = {
  加入题篮: ShoppingBasket,
  布置作业: Send,
  预览: Eye,
}

export function ResourceWorkbench() {
  const [activeTab, setActiveTab] = useState("推荐")
  const [activeSource, setActiveSource] = useState("全部来源")
  const [activeAttrs, setActiveAttrs] = useState<string[]>([])
  const [basket, setBasket] = useState<string[]>([])

  const toggleAttr = (a: string) =>
    setActiveAttrs((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]))

  const filtered = resources.filter((r) => {
    if (activeTab !== "推荐" && r.kind !== activeTab) return false
    if (activeSource === "市级" && r.level !== "市") return false
    if (activeSource === "区级" && r.level !== "区") return false
    if (activeSource === "校本" && r.level !== "校") return false
    if (activeSource === "我的" && r.level !== "我") return false
    if (activeAttrs.includes("含视频讲解") && !r.hasVideo) return false
    if (activeAttrs.includes("可编辑") && !r.editable) return false
    if (activeAttrs.includes("可直接布置") && r.primaryAction !== "布置作业")
      return false
    return true
  })

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* 标题 + 任务卡 */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">资源工作台</h1>
            <nav className="flex items-center gap-1 text-[13px] text-muted-foreground">
              {["2025学年", "下学期", "七年级", "第15章 一元一次不等式"].map(
                (b, i, arr) => (
                  <span key={b} className="flex items-center gap-1">
                    <span className={cn(i === arr.length - 1 && "font-medium text-foreground")}>
                      {b}
                    </span>
                    {i < arr.length - 1 && <ChevronRight className="size-3" />}
                  </span>
                ),
              )}
            </nav>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="搜索题干、知识点、资源名称"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {taskCards.map((card) => (
            <button
              key={card.title}
              onClick={() => setActiveTab(card.type)}
              className="group flex flex-col gap-1 rounded-xl border border-border bg-background p-4 text-left transition hover:border-brand hover:shadow-sm"
            >
              <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                <card.icon className="size-5" strokeWidth={1.75} />
              </div>
              <span className="text-[15px] font-semibold text-foreground">
                {card.title}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {card.desc}
              </span>
            </button>
          ))}
          <Link
            href="/new-question"
            className="group flex flex-col gap-1 rounded-xl border border-brand bg-brand p-4 text-left text-brand-foreground transition hover:opacity-95"
          >
            <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-brand-foreground/15">
              <Plus className="size-5" strokeWidth={2} />
            </div>
            <span className="text-[15px] font-semibold">新增题目</span>
            <span className="text-xs leading-relaxed text-brand-foreground/85">
              轻量录入，AI 补标签
            </span>
          </Link>
        </div>
      </section>

      {/* 资源流 */}
      <section className="flex gap-5">
        <div className="hidden w-72 shrink-0 lg:block">
          <ChapterSidebar />
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-border bg-card p-4">
            {/* 类型 tab + 新增 */}
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
              <div className="flex flex-wrap items-center gap-1">
                {typeTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                      activeTab === t
                        ? "bg-brand text-brand-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Link
                href="/new-question"
                className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90"
              >
                <Plus className="size-4" />
                新增资源
              </Link>
            </div>

            {/* 统一来源筛选条 */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {sourceFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSource(s)}
                  className={cn(
                    "rounded-md border px-3 py-1 text-[13px] transition-colors",
                    activeSource === s
                      ? "border-brand bg-brand-soft font-medium text-brand-soft-foreground"
                      : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-border" />
              {attrFilters.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAttr(a)}
                  className={cn(
                    "rounded-md border px-3 py-1 text-[13px] transition-colors",
                    activeAttrs.includes(a)
                      ? "border-brand bg-brand-soft font-medium text-brand-soft-foreground"
                      : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                >
                  {a}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">
                共 {filtered.length} 条 · 按匹配度排序
              </span>
            </div>

            {/* 资源卡片流 */}
            <div className="flex flex-col gap-3">
              {filtered.map((r) => {
                const ActionIcon = actionIcon[r.primaryAction]
                const inBasket = basket.includes(r.id)
                return (
                  <article
                    key={r.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-brand/50 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <SourceBadge level={r.level} />
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[11px] font-medium",
                            kindStyles[r.kind],
                          )}
                        >
                          {r.kind === "精品讲解" && (
                            <Sparkles className="mr-0.5 inline size-3" />
                          )}
                          {r.kind}资源
                        </span>
                        <h3 className="text-[15px] font-semibold text-foreground">
                          {r.title}
                        </h3>
                      </div>
                      <p className="mb-2 text-xs text-muted-foreground">
                        {r.meta} · 难度：{r.difficulty} · 使用 {r.used} 次
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {r.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                      <button
                        onClick={() =>
                          r.primaryAction === "加入题篮" &&
                          setBasket((p) =>
                            inBasket ? p.filter((x) => x !== r.id) : [...p, r.id],
                          )
                        }
                        className={cn(
                          "flex w-full items-center justify-center gap-1.5 rounded-lg px-5 py-2 text-sm font-medium transition sm:w-32",
                          inBasket
                            ? "bg-brand-soft text-brand-soft-foreground"
                            : "bg-brand text-brand-foreground hover:opacity-90",
                        )}
                      >
                        <ActionIcon className="size-4" />
                        {inBasket ? "已加入" : r.primaryAction}
                      </button>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition hover:border-brand/40 hover:text-foreground">
                          <Eye className="size-3.5" />
                          预览
                        </button>
                        {r.editable ? (
                          <button className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition hover:border-brand/40 hover:text-foreground">
                            <Pencil className="size-3.5" />
                            编辑
                          </button>
                        ) : (
                          <button className="flex items-center justify-center rounded-lg border border-border px-2 py-1.5 text-muted-foreground transition hover:border-brand/40 hover:text-foreground">
                            <MoreHorizontal className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}

              {filtered.length === 0 && (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  当前筛选条件下暂无资源，换个来源或属性试试
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 题篮浮条 */}
      {basket.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-card px-6 py-3 shadow-lg">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShoppingBasket className="size-4 text-brand" />
            题篮已加入 {basket.length} 项
          </span>
          <button className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition hover:opacity-90">
            去组卷 / 布置
          </button>
        </div>
      )}
    </div>
  )
}
