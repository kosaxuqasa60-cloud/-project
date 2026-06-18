"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Check,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Video,
  AudioLines,
  FileText,
  Plus,
  Search,
  X,
  BookOpen,
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

/* 章节目录（第一步选择） */
const chapters = [
  {
    unit: "第15章 一元一次不等式",
    sections: ["15.1 不等式", "15.2 一元一次不等式组", "15.3 一元一次不等式组的应用", "复习与小结"],
  },
  {
    unit: "第16章 相交线与平行线",
    sections: ["16.1 相交线", "16.2 平行线及其判定", "复习与小结"],
  },
  {
    unit: "第17章 三角形",
    sections: ["17.1 三角形的边", "17.2 三角形的内角", "复习与小结"],
  },
]

/* 标签体系：受控词表，按命名空间分组 */
type TagCategory = {
  key: string
  title: string
  required?: boolean
  options: string[]
}

const tagSystem: TagCategory[] = [
  {
    key: "knowledge",
    title: "知识点",
    required: true,
    options: [
      "一元一次不等式",
      "一元一次不等式组",
      "解集表示",
      "公共解集",
      "数轴表示",
      "不等式性质",
      "实际应用",
    ],
  },
  {
    key: "literacy",
    title: "核心素养",
    options: ["数学运算", "逻辑推理", "数学建模", "直观想象", "数据分析"],
  },
  {
    key: "cognitive",
    title: "认知层级",
    options: ["记忆", "理解", "应用", "分析综合"],
  },
  {
    key: "usage",
    title: "教学用途",
    options: ["基础巩固", "易错训练", "课后练习", "课堂讲解", "单元复习", "拓展提升"],
  },
  {
    key: "scene",
    title: "情景属性",
    options: ["纯数学情景", "生活情景", "跨学科情景"],
  },
  {
    key: "error",
    title: "常见错因",
    options: ["不等号方向变化", "公共解集判断错误", "去分母出错", "漏解 / 多解"],
  },
]

const aiSuggested = new Set([
  "一元一次不等式组",
  "解集表示",
  "数轴表示",
  "应用",
  "逻辑推理",
  "易错训练",
  "不等号方向变化",
])

export function NewQuestion() {
  /* 分步导航 */
  const [step, setStep] = useState<1 | 2>(1)
  const [unit, setUnit] = useState(chapters[0].unit)
  const [section, setSection] = useState(chapters[0].sections[1])

  const [activeType, setActiveType] = useState("单项选择题")
  const [stem, setStem] = useState("")
  const [generated, setGenerated] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [openCats, setOpenCats] = useState<string[]>(["knowledge", "literacy", "cognitive"])
  const [customTag, setCustomTag] = useState("")
  const [customTags, setCustomTags] = useState<string[]>([])

  const currentSections = chapters.find((c) => c.unit === unit)?.sections ?? []

  const toggleTag = (t: string) =>
    setSelectedTags((p) => {
      const n = new Set(p)
      n.has(t) ? n.delete(t) : n.add(t)
      return n
    })

  const toggleCat = (k: string) =>
    setOpenCats((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))

  const runAi = () => {
    setGenerated(true)
    setSelectedTags((p) => new Set([...p, ...aiSuggested]))
  }

  const addCustom = () => {
    const t = customTag.trim()
    if (!t || customTags.includes(t)) return
    setCustomTags((p) => [...p, t])
    toggleTag(t)
    setCustomTag("")
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* 头部 + 步骤条 */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-foreground transition hover:text-brand"
        >
          <ChevronLeft className="size-5" />
          新增题目
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => setStep(1)}
            className={cn(
              "flex items-center gap-2 font-medium transition",
              step === 1 ? "text-brand" : "text-foreground hover:text-brand",
            )}
          >
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-xs",
                step === 2
                  ? "bg-brand text-brand-foreground"
                  : step === 1
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {step === 2 ? <Check className="size-3.5" /> : "1"}
            </span>
            选择章节
          </button>
          <span className="h-px w-16 bg-border sm:w-28" />
          <span
            className={cn(
              "flex items-center gap-2 font-medium",
              step === 2 ? "text-brand" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-xs",
                step === 2 ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              2
            </span>
            录入题目
          </span>
        </div>
      </div>

      {/* ----------------- 第一步：选择章节目录 ----------------- */}
      {step === 1 && (
        <div className="mx-auto max-w-2xl">
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand">
                <BookOpen className="size-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">第一步 · 选择章节目录</h2>
                <p className="text-xs text-muted-foreground">
                  先确定题目归属的单元与章节，便于挂载到对应教材结构下。
                </p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {["数学", "七年级下", "沪教版"].map((b, i) => (
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
              ))}
            </div>

            {/* 单元 */}
            <label className="mb-1.5 block text-sm font-medium text-foreground">单元</label>
            <div className="mb-4 flex flex-col gap-1.5">
              {chapters.map((c) => (
                <button
                  key={c.unit}
                  onClick={() => {
                    setUnit(c.unit)
                    setSection(c.sections[0])
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition",
                    unit === c.unit
                      ? "border-brand bg-brand-soft font-medium text-brand-soft-foreground"
                      : "border-border text-foreground hover:border-brand/40 hover:bg-muted",
                  )}
                >
                  {c.unit}
                  {unit === c.unit && <Check className="size-4 text-brand" strokeWidth={3} />}
                </button>
              ))}
            </div>

            {/* 章节 */}
            <label className="mb-1.5 block text-sm font-medium text-foreground">章节</label>
            <div className="mb-6 flex flex-wrap gap-2">
              {currentSections.map((s) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition",
                    section === s
                      ? "border-brand bg-brand font-medium text-brand-foreground"
                      : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground transition hover:opacity-90"
            >
              下一步 · 录入题目
              <ChevronRight className="size-4" />
            </button>
          </section>
        </div>
      )}

      {/* ----------------- 第二步：录入题目核心页 ----------------- */}
      {step === 2 && (
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* 主表单 */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {/* 基础信息 */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">基础信息</h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-brand hover:opacity-80"
                >
                  返回修改章节
                </button>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {["数学", "七年级下", unit, section].map((b, i) => (
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
                ))}
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
              <h2 className="mb-4 text-base font-bold text-foreground">核心内容</h2>
              <div className="flex flex-col gap-5">
                {/* 题干 */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    题干 <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={stem}
                    onChange={(e) => setStem(e.target.value)}
                    rows={4}
                    placeholder="输入或粘贴题干，支持图片与公式。"
                    className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                {/* 答案选项 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">答案选项</label>
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
                    <label className="text-sm font-medium text-foreground">解析</label>
                    <button className="flex items-center gap-1 text-xs font-medium text-brand transition hover:opacity-80">
                      <Sparkles className="size-3.5" />
                      AI 生成解析
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="输入解析，或点击右上角“AI 生成解析”。"
                    className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                {/* 难度 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">难度</label>
                  <div className="flex gap-2">
                    {["易", "中", "难"].map((d) => (
                      <button
                        key={d}
                        className="rounded-lg border border-border px-4 py-1.5 text-sm text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 讲解资源 */}
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-1 text-base font-bold text-foreground">讲解资源</h2>
              <p className="mb-3 text-xs text-muted-foreground">
                每道题可关联讲解视频，沉淀为精品讲解资源。
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

          {/* 右侧：标签体系 */}
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[22rem]">
            <section className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-4">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground">标签体系</h2>
                  <span className="text-xs text-muted-foreground">
                    已选 <span className="font-semibold text-foreground">{selectedTags.size}</span>
                  </span>
                </div>
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  从受控词表中选择各维度标签，或让 AI 依据题干自动打标，老师确认即可。
                </p>
                <button
                  onClick={runAi}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground transition hover:opacity-90"
                >
                  <Sparkles className="size-4" />
                  {generated ? "重新生成标签" : "AI 一键生成标签"}
                </button>
                {generated && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-brand">
                    <Check className="size-3.5" />
                    AI 已根据题干推荐标签，带 ✨ 为建议项，可增删
                  </p>
                )}
              </div>

              {/* 分类标签 */}
              <div className="flex flex-col">
                {tagSystem.map((cat) => {
                  const open = openCats.includes(cat.key)
                  const chosen = cat.options.filter((o) => selectedTags.has(o)).length
                  return (
                    <div key={cat.key} className="border-b border-border last:border-b-0">
                      <button
                        onClick={() => toggleCat(cat.key)}
                        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
                      >
                        <span className="flex items-center gap-1.5">
                          {cat.title}
                          {cat.required && <span className="text-destructive">*</span>}
                          {chosen > 0 && (
                            <span className="rounded-full bg-brand-soft px-1.5 text-[11px] font-semibold text-brand-soft-foreground">
                              {chosen}
                            </span>
                          )}
                        </span>
                        <ChevronDown
                          className={cn("size-4 text-muted-foreground transition", open && "rotate-180")}
                        />
                      </button>
                      {open && (
                        <div className="flex flex-wrap gap-1.5 px-4 pb-4">
                          {cat.options.map((opt) => {
                            const on = selectedTags.has(opt)
                            const ai = generated && aiSuggested.has(opt)
                            return (
                              <button
                                key={opt}
                                onClick={() => toggleTag(opt)}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[12px] transition",
                                  on
                                    ? "border-brand bg-brand-soft font-medium text-brand-soft-foreground"
                                    : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground",
                                )}
                              >
                                {on ? (
                                  <Check className="size-3" strokeWidth={3} />
                                ) : (
                                  <Plus className="size-3" />
                                )}
                                {opt}
                                {ai && <Sparkles className="size-3 text-brand" aria-label="AI 推荐" />}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 自定义标签 */}
              <div className="border-t border-border p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">自定义标签</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustom()}
                      placeholder="输入后回车创建"
                      className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <button
                    onClick={addCustom}
                    className="rounded-lg border border-border px-3 text-sm text-foreground transition hover:bg-muted"
                  >
                    添加
                  </button>
                </div>
                {customTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {customTags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-[12px] font-medium text-accent-foreground"
                      >
                        {t}
                        <button onClick={() => toggleTag(t)} aria-label="移除">
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 保存到 */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  保存到：
                  <span className="font-medium text-foreground">我的资源 / 校本资源</span>
                </span>
                <button className="text-xs font-medium text-brand hover:opacity-80">修改</button>
              </div>
              <p className="mb-2 text-sm font-medium text-foreground">保存后可用于</p>
              <div className="flex flex-wrap gap-1.5">
                {["加入题篮", "组卷", "布置作业", "课堂讲评"].map((u) => (
                  <span
                    key={u}
                    className="rounded-md bg-muted px-2.5 py-1 text-[12px] text-muted-foreground"
                  >
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
              <Link
                href="/"
                className="flex-1 rounded-lg bg-brand py-2.5 text-center text-sm font-medium text-brand-foreground transition hover:opacity-90"
              >
                保存题目
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
