"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  ChevronLeft,
  ChevronDown,
  ClipboardList,
  SlidersHorizontal,
  ListOrdered,
  Volume2,
  Music,
  Mic,
  Upload,
  FolderOpen,
  Sparkles,
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  Play,
  Check,
  Info,
  Settings2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SourceBadge } from "@/components/source-badge"
import type { Question, QType } from "@/components/resource-workbench"

/* 题型顺序与大题标题 */
const TYPE_ORDER: QType[] = ["单选", "多选", "填空", "判断", "主观"]
const TYPE_LABEL: Record<QType, string> = {
  单选: "单项选择题",
  多选: "多项选择题",
  填空: "填空题",
  判断: "判断题",
  主观: "主观题",
}
const CN_NUM = ["一", "二", "三", "四", "五", "六", "七", "八"]

/* 各题型默认分值 */
const DEFAULT_SCORE: Record<QType, number> = {
  单选: 3,
  多选: 4,
  填空: 3,
  判断: 2,
  主观: 8,
}

const diffStyle: Record<string, string> = {
  易: "text-easy bg-easy/10",
  中: "text-medium bg-medium/15",
  难: "text-hard bg-hard/10",
}

type AudioInfo = { name: string; duration: string; source: string }
type DrawerKey = "info" | "score" | "order"

export function ExerciseComposer({
  items,
  onBack,
  onRemove,
}: {
  items: Question[]
  onBack: () => void
  onRemove: (id: string) => void
}) {
  const [name, setName] = useState("第15章 一元一次不等式 · 课堂练习")
  const [drawer, setDrawer] = useState<DrawerKey | null>("info")

  /* 顺序状态：大题顺序 + 全局小题顺序 */
  const presentTypes = useMemo(
    () => TYPE_ORDER.filter((t) => items.some((q) => q.qType === t)),
    [items],
  )
  const [typeSeq, setTypeSeq] = useState<QType[]>(presentTypes)
  const [order, setOrder] = useState<string[]>(items.map((q) => q.id))

  /* 分值：按题型 + 单题覆盖 */
  const [typeScore, setTypeScore] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {}
    TYPE_ORDER.forEach((t) => (base[t] = DEFAULT_SCORE[t]))
    return base
  })
  const [overrides, setOverrides] = useState<Record<string, number>>({})

  /* 作业信息 */
  const [classes, setClasses] = useState<string[]>(["七(1)班", "七(2)班"])
  const [due, setDue] = useState("2026-07-14")
  const [answerMode, setAnswerMode] = useState("点阵笔纸质")
  const [note, setNote] = useState("")

  /* 题目音频 */
  const [audios, setAudios] = useState<Record<string, AudioInfo>>({})
  const [audioModal, setAudioModal] = useState<{ id: string; mode: "add" | "settings" } | null>(null)

  /* —— 计算 —— */
  const itemMap = useMemo(() => Object.fromEntries(items.map((q) => [q.id, q])), [items])
  const validTypeSeq = typeSeq.filter((t) => items.some((q) => q.qType === t))

  const scoreOf = (q: Question) => overrides[q.id] ?? typeScore[q.qType] ?? 0
  const total = items.reduce((s, q) => s + scoreOf(q), 0)

  const groupedIds = (t: QType) =>
    order.filter((id) => itemMap[id]?.qType === t)

  /* —— 排序操作 —— */
  const moveType = (t: QType, dir: -1 | 1) => {
    setTypeSeq((prev) => {
      const arr = [...prev]
      const i = arr.indexOf(t)
      const j = i + dir
      if (j < 0 || j >= arr.length) return prev
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
  }
  const moveQuestion = (id: string, dir: -1 | 1) => {
    setOrder((prev) => {
      const q = itemMap[id]
      const sameType = prev.filter((x) => itemMap[x]?.qType === q.qType)
      const localIdx = sameType.indexOf(id)
      const targetLocal = localIdx + dir
      if (targetLocal < 0 || targetLocal >= sameType.length) return prev
      const swapId = sameType[targetLocal]
      const arr = [...prev]
      const a = arr.indexOf(id)
      const b = arr.indexOf(swapId)
      ;[arr[a], arr[b]] = [arr[b], arr[a]]
      return arr
    })
  }

  const setAudio = (id: string, info: AudioInfo) =>
    setAudios((p) => ({ ...p, [id]: info }))
  const removeAudio = (id: string) =>
    setAudios((p) => {
      const n = { ...p }
      delete n[id]
      return n
    })

  /* —— 空态 —— */
  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <ComposerHeader name={name} setName={setName} total={0} count={0} classes={classes} onBack={onBack} />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <ClipboardList className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">练习里还没有题目</p>
          <button onClick={onBack} className="mt-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
            返回选题
          </button>
        </div>
      </div>
    )
  }

  let globalIdx = 0

  return (
    <div className="flex h-full min-h-0">
      {/* 主编辑区 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ComposerHeader name={name} setName={setName} total={total} count={items.length} classes={classes} onBack={onBack} />

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {validTypeSeq.map((t, ti) => {
              const ids = groupedIds(t)
              if (ids.length === 0) return null
              const groupScore = ids.reduce((s, id) => s + scoreOf(itemMap[id]), 0)
              return (
                <section key={t}>
                  {/* 大题标题 */}
                  <div className="mb-2.5 flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-foreground">
                      {CN_NUM[ti]}、{TYPE_LABEL[t]}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      共 {ids.length} 小题 · 计 {groupScore} 分
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {ids.map((id, i) => {
                      globalIdx += 1
                      return (
                        <ComposerQuestionCard
                          key={id}
                          q={itemMap[id]}
                          index={globalIdx}
                          score={scoreOf(itemMap[id])}
                          audio={audios[id]}
                          isFirst={i === 0}
                          isLast={i === ids.length - 1}
                          onMoveUp={() => moveQuestion(id, -1)}
                          onMoveDown={() => moveQuestion(id, 1)}
                          onRemove={() => onRemove(id)}
                          onAddAudio={() => setAudioModal({ id, mode: "add" })}
                          onAudioSettings={() => setAudioModal({ id, mode: "settings" })}
                          onRemoveAudio={() => removeAudio(id)}
                        />
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </div>

      {/* 右侧抽屉面板 */}
      {drawer && (
        <div className="hidden w-[340px] shrink-0 flex-col border-l border-border bg-card md:flex">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold text-foreground">
              {drawer === "info" ? "作业信息" : drawer === "score" ? "分值设置" : "题型及排序"}
            </h3>
            <button
              onClick={() => setDrawer(null)}
              className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="收起"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {drawer === "info" && (
              <InfoPanel
                name={name}
                setName={setName}
                classes={classes}
                setClasses={setClasses}
                due={due}
                setDue={setDue}
                answerMode={answerMode}
                setAnswerMode={setAnswerMode}
                note={note}
                setNote={setNote}
              />
            )}
            {drawer === "score" && (
              <ScorePanel
                validTypeSeq={validTypeSeq}
                groupedIds={groupedIds}
                itemMap={itemMap}
                typeScore={typeScore}
                setTypeScore={setTypeScore}
                overrides={overrides}
                setOverrides={setOverrides}
                scoreOf={scoreOf}
                total={total}
              />
            )}
            {drawer === "order" && (
              <OrderPanel
                validTypeSeq={validTypeSeq}
                groupedIds={groupedIds}
                itemMap={itemMap}
                moveType={moveType}
                moveQuestion={moveQuestion}
              />
            )}
          </div>
        </div>
      )}

      {/* 右侧常驻操作栏 */}
      <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-l border-border bg-card py-3">
        <RailButton label="作业信息" icon={Info} active={drawer === "info"} onClick={() => setDrawer((d) => (d === "info" ? null : "info"))} />
        <RailButton label="分值设置" icon={SlidersHorizontal} active={drawer === "score"} onClick={() => setDrawer((d) => (d === "score" ? null : "score"))} />
        <RailButton label="题型及排序" icon={ListOrdered} active={drawer === "order"} onClick={() => setDrawer((d) => (d === "order" ? null : "order"))} />
      </nav>

      {/* 题目音频弹窗 */}
      {audioModal && (
        <AudioModal
          mode={audioModal.mode}
          question={itemMap[audioModal.id]}
          audio={audios[audioModal.id]}
          onClose={() => setAudioModal(null)}
          onConfirm={(info) => {
            setAudio(audioModal.id, info)
            setAudioModal(null)
          }}
        />
      )}
    </div>
  )
}

/* ---------------------------- 顶部 ---------------------------- */

function ComposerHeader({
  name,
  setName,
  total,
  count,
  classes,
  onBack,
}: {
  name: string
  setName: (v: string) => void
  total: number
  count: number
  classes: string[]
  onBack: () => void
}) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/85 px-5 py-3 backdrop-blur">
      <button
        onClick={onBack}
        className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        返回选题
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-xl rounded-md border border-transparent bg-transparent text-lg font-bold text-foreground outline-none transition hover:border-border focus:border-brand focus:bg-card focus:px-2"
            aria-label="练习名称"
          />
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>共 <span className="font-semibold text-foreground">{count}</span> 题</span>
            <span>总分 <span className="font-semibold text-foreground">{total}</span> 分</span>
            <span>布置对象 <span className="font-semibold text-foreground">{classes.length}</span> 个班</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
            存为草稿
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90">
            <ClipboardList className="size-4" />
            保存并去布置
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- 题目卡 ---------------------------- */

function ComposerQuestionCard({
  q,
  index,
  score,
  audio,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddAudio,
  onAudioSettings,
  onRemoveAudio,
}: {
  q: Question
  index: number
  score: number
  audio?: AudioInfo
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onAddAudio: () => void
  onAudioSettings: () => void
  onRemoveAudio: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <article className="rounded-xl border border-border bg-card p-4 transition hover:border-brand/40 sm:p-5">
      <div className="flex items-start gap-3">
        {/* 排序手柄 */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="上移"
            className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ArrowUp className="size-3.5" />
          </button>
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">{index}</span>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="下移"
            className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ArrowDown className="size-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {/* 元信息 */}
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-brand-soft px-1.5 py-0.5 font-medium text-brand-soft-foreground">
              {q.qType}
            </span>
            <SourceBadge level={q.level} />
            <span className={cn("rounded px-1.5 py-0.5 font-medium", diffStyle[q.difficulty])}>
              {q.difficulty}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">{score} 分</span>
          </div>

          {/* 题干 */}
          <div className="text-[15px] leading-7 text-foreground">{q.stem}</div>

          {/* 选项 */}
          {q.options && (
            <div className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {q.options.map((o) => (
                <div key={o.key} className="flex items-baseline gap-2 text-sm text-foreground">
                  <span className="font-medium text-muted-foreground">{o.key}.</span>
                  <span>{o.content}</span>
                </div>
              ))}
            </div>
          )}

          {/* 音频条 */}
          {audio && (
            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-brand/30 bg-brand-soft/50 p-2.5">
              <button className="grid size-8 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground transition hover:opacity-90" aria-label="播放音频">
                <Play className="size-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-[13px] font-medium text-foreground">
                  <Music className="size-3.5 text-brand" />
                  {audio.name}
                </p>
                <p className="text-xs text-muted-foreground">{audio.source} · {audio.duration}</p>
              </div>
              <button
                onClick={onRemoveAudio}
                aria-label="删除音频"
                className="rounded-md p-1 text-muted-foreground transition hover:bg-card hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}

          {/* 虚线分隔 */}
          <div className="my-3 border-t border-dashed border-border" />

          {/* 操作行 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
            >
              <ChevronDown className={cn("size-3.5 transition", open && "rotate-180")} />
              展开详情
            </button>
            {audio ? (
              <button
                onClick={onAudioSettings}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
              >
                <Settings2 className="size-3.5" />
                音频设置
              </button>
            ) : (
              <button
                onClick={onAddAudio}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
              >
                <Volume2 className="size-3.5" />
                添加题目音频
              </button>
            )}
            <button
              onClick={onRemove}
              className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
              移出
            </button>
          </div>

          {/* 展开详情 */}
          {open && (
            <div className="mt-3 space-y-2.5 rounded-lg border border-border bg-muted/30 p-3 text-sm leading-7">
              <div className="flex gap-2">
                <span className="shrink-0 font-medium text-brand">【答案】</span>
                <div>{q.answer}</div>
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <span className="shrink-0 font-medium text-foreground">【解析】</span>
                <div>{q.analysis}</div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-card p-2.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
                  <PlayCircle className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{q.videoTitle}</p>
                  <p className="text-xs text-muted-foreground">讲解视频 · {q.videoDuration}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

/* ---------------------------- 右栏按钮 ---------------------------- */

function RailButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon: React.ElementType
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-14 flex-col items-center gap-1 rounded-lg py-2.5 text-[11px] font-medium leading-tight transition",
        active
          ? "bg-brand-soft text-brand-soft-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-5" />
      <span className="text-center">{label}</span>
    </button>
  )
}

/* ---------------------------- 作业信息面板 ---------------------------- */

const ALL_CLASSES = ["七(1)班", "七(2)班", "七(3)班", "七(4)班", "八(1)班", "八(2)班"]
const ANSWER_MODES = ["在线作答", "点阵笔纸质", "打印下发"]

function InfoPanel({
  name,
  setName,
  classes,
  setClasses,
  due,
  setDue,
  answerMode,
  setAnswerMode,
  note,
  setNote,
}: {
  name: string
  setName: (v: string) => void
  classes: string[]
  setClasses: (v: string[]) => void
  due: string
  setDue: (v: string) => void
  answerMode: string
  setAnswerMode: (v: string) => void
  note: string
  setNote: (v: string) => void
}) {
  const toggleClass = (c: string) =>
    setClasses(classes.includes(c) ? classes.filter((x) => x !== c) : [...classes, c])
  return (
    <div className="flex flex-col gap-4">
      <Field label="练习名称">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </Field>
      <Field label="学科 / 教材">
        <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">数学 · 沪教版 · 七年级下册</div>
      </Field>
      <Field label="布置对象">
        <div className="flex flex-wrap gap-1.5">
          {ALL_CLASSES.map((c) => {
            const on = classes.includes(c)
            return (
              <button
                key={c}
                onClick={() => toggleClass(c)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[13px] transition",
                  on
                    ? "border-brand bg-brand-soft font-medium text-brand-soft-foreground"
                    : "border-border text-muted-foreground hover:border-brand/40",
                )}
              >
                {on && <Check className="size-3" />}
                {c}
              </button>
            )
          })}
        </div>
      </Field>
      <Field label="截止时间">
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </Field>
      <Field label="作答方式">
        <div className="flex flex-col gap-1.5">
          {ANSWER_MODES.map((m) => (
            <button
              key={m}
              onClick={() => setAnswerMode(m)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                answerMode === m
                  ? "border-brand bg-brand-soft/50 text-foreground"
                  : "border-border text-muted-foreground hover:border-brand/40",
              )}
            >
              <span
                className={cn(
                  "grid size-4 place-items-center rounded-full border",
                  answerMode === m ? "border-brand" : "border-muted-foreground/40",
                )}
              >
                {answerMode === m && <span className="size-2 rounded-full bg-brand" />}
              </span>
              {m}
            </button>
          ))}
        </div>
      </Field>
      <Field label="练习说明（选填）">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="给学生的提示，如作答要求、时间建议等"
          className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </Field>
    </div>
  )
}

/* ---------------------------- 分值设置面板 ---------------------------- */

function ScorePanel({
  validTypeSeq,
  groupedIds,
  itemMap,
  typeScore,
  setTypeScore,
  overrides,
  setOverrides,
  scoreOf,
  total,
}: {
  validTypeSeq: QType[]
  groupedIds: (t: QType) => string[]
  itemMap: Record<string, Question>
  typeScore: Record<string, number>
  setTypeScore: (fn: (p: Record<string, number>) => Record<string, number>) => void
  overrides: Record<string, number>
  setOverrides: (fn: (p: Record<string, number>) => Record<string, number>) => void
  scoreOf: (q: Question) => number
  total: number
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg bg-brand-soft/60 px-3 py-2.5">
        <span className="text-sm text-brand-soft-foreground">试卷总分</span>
        <span className="text-lg font-bold text-brand-soft-foreground">{total} 分</span>
      </div>

      {validTypeSeq.map((t) => {
        const ids = groupedIds(t)
        return (
          <div key={t} className="rounded-lg border border-border">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
              <span className="text-[13px] font-semibold text-foreground">{TYPE_LABEL[t]}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">每题</span>
                <input
                  type="number"
                  min={0}
                  value={typeScore[t]}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 0
                    setTypeScore((p) => ({ ...p, [t]: v }))
                    /* 批量应用：清除该题型单题覆盖 */
                    setOverrides((p) => {
                      const n = { ...p }
                      ids.forEach((id) => delete n[id])
                      return n
                    })
                  }}
                  className="w-14 rounded-md border border-border bg-card px-2 py-1 text-center text-sm outline-none focus:border-brand"
                />
                <span className="text-xs text-muted-foreground">分</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {ids.map((id, i) => {
                const q = itemMap[id]
                return (
                  <div key={id} className="flex items-center gap-2 px-3 py-2">
                    <span className="w-5 shrink-0 text-xs font-medium text-muted-foreground">{i + 1}.</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{q.short}</span>
                    <input
                      type="number"
                      min={0}
                      value={scoreOf(q)}
                      onChange={(e) =>
                        setOverrides((p) => ({ ...p, [id]: Number(e.target.value) || 0 }))
                      }
                      className="w-14 shrink-0 rounded-md border border-border bg-card px-2 py-1 text-center text-sm outline-none focus:border-brand"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------------------- 题型及排序面板 ---------------------------- */

function OrderPanel({
  validTypeSeq,
  groupedIds,
  itemMap,
  moveType,
  moveQuestion,
}: {
  validTypeSeq: QType[]
  groupedIds: (t: QType) => string[]
  itemMap: Record<string, Question>
  moveType: (t: QType, dir: -1 | 1) => void
  moveQuestion: (id: string, dir: -1 | 1) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        调整大题（题型）顺序，或大题内小题顺序，练习正文实时同步。
      </p>
      {validTypeSeq.map((t, ti) => {
        const ids = groupedIds(t)
        return (
          <div key={t} className="rounded-lg border border-border">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
              <span className="text-[13px] font-semibold text-foreground">
                {CN_NUM[ti]}、{TYPE_LABEL[t]}
                <span className="ml-1 text-xs font-normal text-muted-foreground">{ids.length} 题</span>
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => moveType(t, -1)}
                  disabled={ti === 0}
                  aria-label="大题上移"
                  className="rounded p-1 text-muted-foreground transition hover:bg-card hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  onClick={() => moveType(t, 1)}
                  disabled={ti === validTypeSeq.length - 1}
                  aria-label="大题下移"
                  className="rounded p-1 text-muted-foreground transition hover:bg-card hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {ids.map((id, i) => (
                <div key={id} className="flex items-center gap-2 px-3 py-2">
                  <span className="w-5 shrink-0 text-xs font-medium text-muted-foreground">{i + 1}.</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{itemMap[id].short}</span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      onClick={() => moveQuestion(id, -1)}
                      disabled={i === 0}
                      aria-label="小题上移"
                      className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      onClick={() => moveQuestion(id, 1)}
                      disabled={i === ids.length - 1}
                      aria-label="小题下移"
                      className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------------------- 题目音频弹窗 ---------------------------- */

const AUDIO_SOURCES = [
  { key: "upload", label: "上传音频文件", desc: "支持 mp3 / m4a，≤ 20MB", icon: Upload },
  { key: "ai", label: "AI 智能朗读生成", desc: "按题干自动生成朗读，可调语速音色", icon: Sparkles },
  { key: "library", label: "从资源库选择", desc: "选择校本 / 平台已有音频", icon: FolderOpen },
] as const

function AudioModal({
  mode,
  question,
  audio,
  onClose,
  onConfirm,
}: {
  mode: "add" | "settings"
  question: Question
  audio?: AudioInfo
  onClose: () => void
  onConfirm: (info: AudioInfo) => void
}) {
  const [generating, setGenerating] = useState(false)
  const [plays, setPlays] = useState("不限")
  const [autoPlay, setAutoPlay] = useState(false)
  const [rate, setRate] = useState("1.0x")

  const pickSource = (key: string) => {
    if (key === "ai") {
      setGenerating(true)
      setTimeout(() => {
        setGenerating(false)
        onConfirm({ name: "AI 朗读 · " + question.short, duration: "00:18", source: "AI 生成" })
      }, 900)
      return
    }
    if (key === "upload") {
      onConfirm({ name: "录音_" + question.id + ".mp3", duration: "00:24", source: "本地上传" })
      return
    }
    onConfirm({ name: question.videoTitle + "（音频）", duration: "00:31", source: "资源库" })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-label="关闭" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            {mode === "add" ? <Mic className="size-4 text-brand" /> : <Settings2 className="size-4 text-brand" />}
            {mode === "add" ? "添加题目音频" : "题目音频设置"}
          </h3>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="mb-3 truncate text-xs text-muted-foreground">题目：{question.short}</p>

          {mode === "add" ? (
            generating ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Sparkles className="size-8 animate-pulse text-brand" />
                <p className="text-sm text-muted-foreground">AI 正在生成朗读音频…</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {AUDIO_SOURCES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => pickSource(s.key)}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-brand hover:bg-brand-soft/40"
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                      <s.icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4">
              {audio && (
                <div className="flex items-center gap-2.5 rounded-lg border border-brand/30 bg-brand-soft/40 p-2.5">
                  <Music className="size-4 text-brand" />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{audio.name}</span>
                  <span className="text-xs text-muted-foreground">{audio.duration}</span>
                </div>
              )}
              <Field label="可播放次数">
                <div className="flex gap-1.5">
                  {["不限", "1 次", "2 次", "3 次"].map((p) => (
                    <SegBtn key={p} on={plays === p} onClick={() => setPlays(p)}>{p}</SegBtn>
                  ))}
                </div>
              </Field>
              <Field label="播放语速">
                <div className="flex gap-1.5">
                  {["0.75x", "1.0x", "1.25x", "1.5x"].map((r) => (
                    <SegBtn key={r} on={rate === r} onClick={() => setRate(r)}>{r}</SegBtn>
                  ))}
                </div>
              </Field>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <span className="text-sm text-foreground">进入题目自动播放</span>
                <button
                  type="button"
                  onClick={() => setAutoPlay((v) => !v)}
                  className={cn(
                    "relative h-6 w-10 rounded-full transition",
                    autoPlay ? "bg-brand" : "bg-muted-foreground/30",
                  )}
                  aria-pressed={autoPlay}
                >
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-card transition", autoPlay ? "left-[1.125rem]" : "left-0.5")} />
                </button>
              </label>
              <button
                onClick={() => audio && onConfirm(audio)}
                className="mt-1 w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-brand-foreground transition hover:opacity-90"
              >
                保存设置
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- 通用小组件 ---------------------------- */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function SegBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md border px-2 py-1.5 text-[13px] transition",
        on ? "border-brand bg-brand-soft font-medium text-brand-soft-foreground" : "border-border text-muted-foreground hover:border-brand/40",
      )}
    >
      {children}
    </button>
  )
}
