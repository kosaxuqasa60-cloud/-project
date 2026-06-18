"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Check,
  Sparkles,
  RefreshCw,
  ChevronDown,
  Plus,
  Video,
  AudioLines,
  FileText,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const questionTypes = [
  "单项选择题",
  "多项选择题",
  "判断题",
  "填空题",
  "主观题",
  "连线题",
  "组合题",
]

const tagGroups = [
  {
    title: "知识点",
    color: "bg-brand-soft text-brand-soft-foreground",
    tags: ["一元一次不等式组", "解集表示", "数轴"],
  },
  {
    title: "教学标签",
    color: "bg-brand-soft text-brand-soft-foreground",
    tags: ["基础巩固", "易错训练", "课后练习"],
  },
  {
    title: "难度与用时",
    color: "bg-secondary text-secondary-foreground",
    tags: ["中等", "预计3分钟"],
  },
  {
    title: "常见错因",
    color: "bg-warn/30 text-warn-foreground",
    tags: ["不等号方向变化", "公共解集判断错误"],
  },
]

const advancedAttrs = [
  { label: "学习水平", value: "理解应用" },
  { label: "核心素养", value: "逻辑推理 · 数学运算" },
  { label: "内容领域", value: "数与代数" },
  { label: "主题", value: "不等式" },
  { label: "单元目标", value: "掌握不等式组解法" },
  { label: "章节目标", value: "会求公共解集" },
  { label: "情景属性", value: "纯数学情景" },
]

const saveUses = ["加入题篮", "组卷", "布置作业", "课堂讲评"]

export function NewQuestion() {
  const [step] = useState(2)
  const [activeType, setActiveType] = useState("单项选择题")
  const [activeContentTab, setActiveContentTab] = useState<"核心内容" | "题目属性">(
    "核心内容",
  )
  const [stem, setStem] = useState("")
  const [recognized, setRecognized] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [tagState, setTagState] = useState(
    tagGroups.map((g) => g.tags.map(() => true)),
  )

  const toggleTag = (gi: number, ti: number) =>
    setTagState((p) =>
      p.map((g, i) =>
        i === gi ? g.map((v, j) => (j === ti ? !v : v)) : g,
      ),
    )

  return (
    <div className="p-6">
      {/* 头部 + 步骤条 */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-foreground transition hover:text-brand"
        >
          <ChevronLeft className="size-5" />
          新增题目
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-2 font-medium text-brand">
            <span className="grid size-6 place-items-center rounded-full bg-brand text-xs text-brand-foreground">
              <Check className="size-3.5" />
            </span>
            选择章节
          </span>
          <span className="h-px w-16 bg-border sm:w-28" />
          <span className="flex items-center gap-2 font-medium text-foreground">
            <span className="grid size-6 place-items-center rounded-full bg-brand text-xs text-brand-foreground">
              2
            </span>
            录入题目
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* 主表单 */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* 基础信息 */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-base font-bold text-foreground">基础信息</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {["数学", "七年级下", "第15章 一元一次不等式", "15.2 一元一次不等式组"].map(
                (b, i) => (
                  <span
                    key={b}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[13px] font-medium",
                      i === 0
                        ? "bg-brand text-brand-foreground"
                        : "bg-brand-soft text-brand-soft-foreground",
                    )}
                  >
                    {b}
                  </span>
                ),
              )}
            </div>
            <p className="mb-2 text-sm font-medium text-foreground">题目类型</p>
            <div className="flex flex-wrap gap-2">
              {questionTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={cn(
                    "rounded-lg border px-3.5 py-1.5 text-sm transition-colors",
                    activeType === t
                      ? "border-brand bg-brand font-medium text-brand-foreground"
                      : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* 核心内容 */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex w-fit rounded-lg border border-border p-0.5">
              {(["核心内容", "题目属性"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveContentTab(t)}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                    activeContentTab === t
                      ? "bg-brand text-brand-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {activeContentTab === "核心内容" ? (
              <div className="flex flex-col gap-5">
                {/* 题干 */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    题干 <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={stem}
                    onChange={(e) => {
                      setStem(e.target.value)
                      setRecognized(e.target.value.length > 6)
                    }}
                    rows={4}
                    placeholder="输入题干，支持粘贴图片、公式和整题文本。系统会自动识别知识点和标签。"
                    className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  {recognized && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-brand">
                      <Sparkles className="size-3.5" />
                      AI 已识别该题，右侧标签建议已更新
                    </p>
                  )}
                </div>

                {/* 答案选项 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    答案选项
                  </label>
                  <div className="flex flex-col gap-2">
                    {["A", "B", "C", "D"].map((opt) => (
                      <div key={opt} className="flex items-center gap-3">
                        <span className="grid size-5 place-items-center rounded-full border border-border text-xs font-medium text-muted-foreground">
                          {opt}
                        </span>
                        <input
                          placeholder="选项内容"
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 解析 */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      解析
                    </label>
                    <button className="flex items-center gap-1 text-xs font-medium text-brand transition hover:opacity-80">
                      <Sparkles className="size-3.5" />
                      AI 生成解析
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="输入解析，或点击右侧“AI 生成解析”。"
                    className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
                高级属性已下沉为右侧「AI 标签建议」，由系统自动补全。如需逐项手填，可在此展开，但通常无需操作。
              </div>
            )}
          </section>

          {/* 讲解资源 */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-1 text-base font-bold text-foreground">讲解资源</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              若该题属于精品讲解资源，可在这里关联视频微课；普通题目可留空。
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "上传讲解视频", icon: Video },
                { label: "上传解析音频", icon: AudioLines },
                { label: "生成讲解脚本", icon: FileText },
              ].map((b) => (
                <button
                  key={b.label}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm text-foreground transition hover:border-brand/40 hover:bg-muted"
                >
                  <b.icon className="size-4 text-brand" />
                  {b.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* AI 标签建议侧栏 */}
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
          <section className="rounded-xl border border-brand/30 bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-base font-bold text-foreground">
                <Sparkles className="size-4 text-brand" />
                AI 标签建议
              </h2>
              <button className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition hover:border-brand/40 hover:text-foreground">
                <RefreshCw className="size-3" />
                重新识别
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {tagGroups.map((group, gi) => (
                <div key={group.title}>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    {group.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map((tag, ti) => {
                      const on = tagState[gi][ti]
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(gi, ti)}
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium transition",
                            on
                              ? group.color
                              : "border border-dashed border-border text-muted-foreground line-through",
                          )}
                        >
                          {on ? <Check className="size-3" /> : <X className="size-3" />}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
              点选标签即可确认或剔除。无需手动逐项填写，老师只需「看一眼、点确认」。
            </p>
          </section>

          {/* 高级属性折叠 */}
          <section className="rounded-xl border border-border bg-card">
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-medium text-foreground"
            >
              展开高级属性
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  showAdvanced && "rotate-180",
                )}
              />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-2 border-t border-border px-5 py-4">
                {advancedAttrs.map((a) => (
                  <div
                    key={a.label}
                    className="flex items-center justify-between text-[13px]"
                  >
                    <span className="text-muted-foreground">{a.label}</span>
                    <span className="font-medium text-foreground">{a.value}</span>
                  </div>
                ))}
                <p className="mt-1 text-xs text-brand">已由 AI 自动补全</p>
              </div>
            )}
          </section>

          {/* 保存到 */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                保存到：
                <span className="font-medium text-foreground">我的资源 / 校本资源</span>
              </span>
              <button className="text-xs font-medium text-brand hover:opacity-80">
                修改
              </button>
            </div>
            <p className="mb-2 text-sm font-medium text-foreground">保存后可用于</p>
            <div className="flex flex-wrap gap-1.5">
              {saveUses.map((u) => (
                <span
                  key={u}
                  className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-[12px] text-muted-foreground"
                >
                  <Plus className="size-3" />
                  {u}
                </span>
              ))}
            </div>
          </section>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button className="flex-1 rounded-lg border border-border bg-card py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">
              保存草稿
            </button>
            <button className="flex-1 rounded-lg border border-brand bg-brand-soft py-2.5 text-sm font-medium text-brand-soft-foreground transition hover:opacity-90">
              保存并继续
            </button>
            <Link
              href="/"
              className="flex-1 rounded-lg bg-brand py-2.5 text-center text-sm font-medium text-brand-foreground transition hover:opacity-90"
            >
              保存题目
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
