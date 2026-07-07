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
  PlayCircle,
  Play,
  Check,
  Info,
  Settings2,
  GripVertical,
  Plus,
  Pencil,
  Search,
  ListPlus,
  CornerDownRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SourceBadge } from "@/components/source-badge"
import { questions as bank, type Question, type QType } from "@/components/resource-workbench"

/* 题型顺序与大题标题 */
const TYPE_ORDER: QType[] = ["单选", "多选", "填空", "判断", "主观"]
const TYPE_LABEL: Record<QType, string> = {
  单选: "单项选择题",
  多选: "多项选择题",
  填空: "填空题",
  判断: "判断题",
  主观: "主观题",
}
const CN_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]

/* 各题型默认分值 */
const DEFAULT_SCORE: Record<QType, number> = {
  单选: 3,
  多选: 4,
  填空: 3,
  判断: 2,
  主观: 8,
}

/* 每题的“问数”（用于按问赋分）：主观 3 问、填空 2 问、其余 1 问 */
const subCountOf = (q: Question) => (q.qType === "主观" ? 3 : q.qType === "填空" ? 2 : 1)

const diffStyle: Record<string, string> = {
  易: "text-easy bg-easy/10",
  中: "text-medium bg-medium/15",
  难: "text-hard bg-hard/10",
}

type AudioInfo = { name: string; duration: string; source: string }
type DrawerKey = "info" | "score" | "order"
type Section = { id: string; title: string; questionIds: string[]; collapsed: boolean }
type DragState = { kind: "sec" | "q"; id: string } | null

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
  const [drawer, setDrawer] = useState<DrawerKey | null>("order")

  /* 题库映射（含跟进练习可选题） */
  const bankMap = useMemo(() => Object.fromEntries(bank.map((q) => [q.id, q])), [])
  const lookup = (id: string) => bankMap[id] as Question | undefined

  /* 大题（section）模型：按题型初始化，可自定义 */
  const [sections, setSections] = useState<Section[]>(() => {
    const present = TYPE_ORDER.filter((t) => items.some((q) => q.qType === t))
    return present.map((t) => ({
      id: "sec-" + t,
      title: TYPE_LABEL[t],
      questionIds: items.filter((q) => q.qType === t).map((q) => q.id),
      collapsed: false,
    }))
  })

  /* 分值：按题型 + 单题覆盖 */
  const [typeScore] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {}
    TYPE_ORDER.forEach((t) => (base[t] = DEFAULT_SCORE[t]))
    return base
  })
  const [overrides, setOverrides] = useState<Record<string, number>>({})

  /* 作业信息（无练习说明） */
  const [classes, setClasses] = useState<string[]>(["七(1)班", "七(2)班"])
  const [due, setDue] = useState("2026-07-14")
  const [answerMode, setAnswerMode] = useState("点阵笔纸质")

  /* 题目音频 & 跟进练习 */
  const [audios, setAudios] = useState<Record<string, AudioInfo>>({})
  const [audioModal, setAudioModal] = useState<{ id: string; mode: "add" | "settings" } | null>(null)
  const [followUps, setFollowUps] = useState<Record<string, string[]>>({})
  const [pickerFor, setPickerFor] = useState<string | null>(null)

  /* 拖拽 */
  const [drag, setDrag] = useState<DragState>(null)

  /* —— 计算 —— */
  const allIds = sections.flatMap((s) => s.questionIds)
  const scoreOf = (q: Question) => overrides[q.id] ?? typeScore[q.qType] ?? 0
  const total = allIds.reduce((s, id) => {
    const q = lookup(id)
    return q ? s + scoreOf(q) : s
  }, 0)

  /* —— 大题操作 —— */
  const addSection = () =>
    setSections((p) => [
      ...p,
      { id: "sec-" + Date.now(), title: "新大题", questionIds: [], collapsed: false },
    ])
  const renameSection = (id: string, title: string) =>
    setSections((p) => p.map((s) => (s.id === id ? { ...s, title } : s)))
  const deleteSection = (id: string) =>
    setSections((p) => p.filter((s) => !(s.id === id && s.questionIds.length === 0)))
  const toggleCollapse = (id: string) =>
    setSections((p) => p.map((s) => (s.id === id ? { ...s, collapsed: !s.collapsed } : s)))

  /* —— 排序（拖拽） —— */
  const reorderSections = (fromId: string, toId: string) =>
    setSections((prev) => {
      const arr = [...prev]
      const from = arr.findIndex((s) => s.id === fromId)
      const to = arr.findIndex((s) => s.id === toId)
      if (from < 0 || to < 0 || from === to) return prev
      const [m] = arr.splice(from, 1)
      arr.splice(to, 0, m)
      return arr
    })
  const moveQuestion = (qId: string, targetSecId: string, targetQId: string | null) =>
    setSections((prev) => {
      let next = prev.map((s) => ({ ...s, questionIds: s.questionIds.filter((x) => x !== qId) }))
      next = next.map((s) => {
        if (s.id !== targetSecId) return s
        const arr = [...s.questionIds]
        const idx = targetQId ? arr.indexOf(targetQId) : arr.length
        arr.splice(idx < 0 ? arr.length : idx, 0, qId)
        return { ...s, questionIds: arr }
      })
      return next
    })

  /* —— 移出 / 音频 / 跟进 —— */
  const handleRemove = (id: string) => {
    setSections((p) => p.map((s) => ({ ...s, questionIds: s.questionIds.filter((x) => x !== id) })))
    onRemove(id)
  }
  const setAudio = (id: string, info: AudioInfo) => setAudios((p) => ({ ...p, [id]: info }))
  const removeAudio = (id: string) =>
    setAudios((p) => {
      const n = { ...p }
      delete n[id]
      return n
    })
  const addFollowUps = (qId: string, ids: string[]) =>
    setFollowUps((p) => ({ ...p, [qId]: Array.from(new Set([...(p[qId] ?? []), ...ids])) }))
  const removeFollowUp = (qId: string, fid: string) =>
    setFollowUps((p) => ({ ...p, [qId]: (p[qId] ?? []).filter((x) => x !== fid) }))

  /* —— 空态 —— */
  if (allIds.length === 0 && sections.every((s) => s.questionIds.length === 0)) {
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
        <ComposerHeader name={name} setName={setName} total={total} count={allIds.length} classes={classes} onBack={onBack} />

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {sections.map((sec, si) => {
              const ids = sec.questionIds
              const groupScore = ids.reduce((s, id) => {
                const q = lookup(id)
                return q ? s + scoreOf(q) : s
              }, 0)
              return (
                <section
                  key={sec.id}
                  onDragOver={(e) => drag?.kind === "q" && e.preventDefault()}
                  onDrop={() => {
                    if (drag?.kind === "q") moveQuestion(drag.id, sec.id, null)
                    setDrag(null)
                  }}
                >
                  {/* 大题标题（可收起） */}
                  <div className="mb-2.5 flex items-center gap-2">
                    <button
                      onClick={() => toggleCollapse(sec.id)}
                      className="rounded p-0.5 text-muted-foreground transition hover:text-foreground"
                      aria-label={sec.collapsed ? "展开大题" : "收起大题"}
                    >
                      <ChevronDown className={cn("size-4 transition", sec.collapsed && "-rotate-90")} />
                    </button>
                    <h2 className="text-[15px] font-bold text-foreground">
                      {CN_NUM[si]}、{sec.title}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      共 {ids.length} 小题 · 计 {groupScore} 分
                    </span>
                  </div>
                  {!sec.collapsed && (
                    <div className="flex flex-col gap-3">
                      {ids.length === 0 && (
                        <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                          该大题暂无题目，可在“题型及排序”中拖入题目
                        </div>
                      )}
                      {ids.map((id) => {
                        const q = lookup(id)
                        if (!q) return null
                        globalIdx += 1
                        return (
                          <ComposerQuestionCard
                            key={id}
                            q={q}
                            index={globalIdx}
                            score={scoreOf(q)}
                            audio={audios[id]}
                            followUps={(followUps[id] ?? []).map(lookup).filter(Boolean) as Question[]}
                            dragging={drag?.kind === "q" && drag.id === id}
                            onDragStart={() => setDrag({ kind: "q", id })}
                            onDragEnd={() => setDrag(null)}
                            onDropBefore={() => {
                              if (drag?.kind === "q" && drag.id !== id) moveQuestion(drag.id, sec.id, id)
                              setDrag(null)
                            }}
                            onRemove={() => handleRemove(id)}
                            onAddAudio={() => setAudioModal({ id, mode: "add" })}
                            onAudioSettings={() => setAudioModal({ id, mode: "settings" })}
                            onRemoveAudio={() => removeAudio(id)}
                            onAddFollowUp={() => setPickerFor(id)}
                            onRemoveFollowUp={(fid) => removeFollowUp(id, fid)}
                          />
                        )
                      })}
                    </div>
                  )}
                </section>
              )
            })}

            {/* 自定义新增大题 */}
            <button
              onClick={addSection}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition hover:border-brand hover:text-brand"
            >
              <Plus className="size-4" />
              自定义新增大题
            </button>
          </div>
        </div>
      </div>

      {/* 右侧抽屉面板 */}
      {drawer && (
        <div className="hidden w-[360px] shrink-0 flex-col border-l border-border bg-card md:flex">
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
              />
            )}
            {drawer === "score" && (
              <ScorePanel
                sections={sections}
                lookup={lookup}
                overrides={overrides}
                setOverrides={setOverrides}
                scoreOf={scoreOf}
                total={total}
                allIds={allIds}
              />
            )}
            {drawer === "order" && (
              <OrderPanel
                sections={sections}
                lookup={lookup}
                drag={drag}
                setDrag={setDrag}
                reorderSections={reorderSections}
                moveQuestion={moveQuestion}
                renameSection={renameSection}
                deleteSection={deleteSection}
                toggleCollapse={toggleCollapse}
                addSection={addSection}
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
      {audioModal && lookup(audioModal.id) && (
        <AudioModal
          mode={audioModal.mode}
          question={lookup(audioModal.id)!}
          audio={audios[audioModal.id]}
          onClose={() => setAudioModal(null)}
          onConfirm={(info) => {
            setAudio(audioModal.id, info)
            setAudioModal(null)
          }}
        />
      )}

      {/* 跟进练习选题弹窗 */}
      {pickerFor && lookup(pickerFor) && (
        <QuestionPickerModal
          anchor={lookup(pickerFor)!}
          exclude={[...allIds, ...(followUps[pickerFor] ?? []), pickerFor]}
          onClose={() => setPickerFor(null)}
          onConfirm={(ids) => {
            addFollowUps(pickerFor, ids)
            setPickerFor(null)
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
  followUps,
  dragging,
  onDragStart,
  onDragEnd,
  onDropBefore,
  onRemove,
  onAddAudio,
  onAudioSettings,
  onRemoveAudio,
  onAddFollowUp,
  onRemoveFollowUp,
}: {
  q: Question
  index: number
  score: number
  audio?: AudioInfo
  followUps: Question[]
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDropBefore: () => void
  onRemove: () => void
  onAddAudio: () => void
  onAudioSettings: () => void
  onRemoveAudio: () => void
  onAddFollowUp: () => void
  onRemoveFollowUp: (fid: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <article
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropBefore}
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition hover:border-brand/40 sm:p-5",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-3">
        {/* 拖拽手柄 + 序号 */}
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="flex cursor-grab flex-col items-center gap-0.5 pt-0.5 active:cursor-grabbing"
          title="拖拽调整顺序"
        >
          <GripVertical className="size-4 text-muted-foreground/60" />
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">{index}</span>
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

          {/* 跟进练习 */}
          {followUps.length > 0 && (
            <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <CornerDownRight className="size-3.5" />
                跟进练习 · {followUps.length} 题
              </p>
              {followUps.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2 rounded-md bg-card px-2.5 py-2">
                  <span className="text-xs font-medium text-brand">跟进{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{f.short}</span>
                  <span className="shrink-0 rounded bg-brand-soft px-1.5 py-0.5 text-[11px] text-brand-soft-foreground">{f.qType}</span>
                  <button
                    onClick={() => onRemoveFollowUp(f.id)}
                    aria-label="移除跟进练习"
                    className="shrink-0 rounded p-0.5 text-muted-foreground transition hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
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
              onClick={onAddFollowUp}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
            >
              <ListPlus className="size-3.5" />
              添加跟进练习
            </button>
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

/* ---------------------------- 作业信息面板（无练习说明） ---------------------------- */

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
}: {
  name: string
  setName: (v: string) => void
  classes: string[]
  setClasses: (v: string[]) => void
  due: string
  setDue: (v: string) => void
  answerMode: string
  setAnswerMode: (v: string) => void
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
    </div>
  )
}

/* ---------------------------- 分值设置面板 ---------------------------- */

function ScorePanel({
  sections,
  lookup,
  overrides,
  setOverrides,
  scoreOf,
  total,
  allIds,
}: {
  sections: Section[]
  lookup: (id: string) => Question | undefined
  overrides: Record<string, number>
  setOverrides: (fn: (p: Record<string, number>) => Record<string, number>) => void
  scoreOf: (q: Question) => number
  total: number
  allIds: string[]
}) {
  const [perQuestion, setPerQuestion] = useState(5)
  const [perSub, setPerSub] = useState(2)

  /* 按题自动赋分：每题统一分值 */
  const applyPerQuestion = () =>
    setOverrides(() => {
      const n: Record<string, number> = {}
      allIds.forEach((id) => (n[id] = perQuestion))
      return n
    })
  /* 按问自动赋分：每题 = 问数 × 每问分值 */
  const applyPerSub = () =>
    setOverrides(() => {
      const n: Record<string, number> = {}
      allIds.forEach((id) => {
        const q = lookup(id)
        if (q) n[id] = subCountOf(q) * perSub
      })
      return n
    })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg bg-brand-soft/60 px-3 py-2.5">
        <span className="text-sm text-brand-soft-foreground">试卷总分</span>
        <span className="text-lg font-bold text-brand-soft-foreground">{total} 分</span>
      </div>

      {/* 自动赋分 */}
      <div className="rounded-lg border border-border p-3">
        <p className="mb-2.5 flex items-center gap-1 text-[13px] font-semibold text-foreground">
          <Sparkles className="size-3.5 text-brand" />
          自动赋分
        </p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-[13px] text-muted-foreground">按题赋分</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">每题</span>
              <input
                type="number"
                min={0}
                value={perQuestion}
                onChange={(e) => setPerQuestion(Number(e.target.value) || 0)}
                className="w-14 rounded-md border border-border bg-card px-2 py-1 text-center text-sm outline-none focus:border-brand"
              />
              <span className="text-xs text-muted-foreground">分</span>
            </div>
            <button
              onClick={applyPerQuestion}
              className="ml-auto rounded-md bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-soft-foreground transition hover:bg-brand hover:text-brand-foreground"
            >
              应用
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-[13px] text-muted-foreground">按问赋分</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">每问</span>
              <input
                type="number"
                min={0}
                value={perSub}
                onChange={(e) => setPerSub(Number(e.target.value) || 0)}
                className="w-14 rounded-md border border-border bg-card px-2 py-1 text-center text-sm outline-none focus:border-brand"
              />
              <span className="text-xs text-muted-foreground">分</span>
            </div>
            <button
              onClick={applyPerSub}
              className="ml-auto rounded-md bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-soft-foreground transition hover:bg-brand hover:text-brand-foreground"
            >
              应用
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            按问赋分依据每题“问数”自动计算（主观 3 问、填空 2 问、其余 1 问），可在下方逐题微调。
          </p>
        </div>
      </div>

      {/* 逐题微调 */}
      {sections.map((sec, si) => {
        if (sec.questionIds.length === 0) return null
        return (
          <div key={sec.id} className="rounded-lg border border-border">
            <div className="border-b border-border bg-muted/40 px-3 py-2 text-[13px] font-semibold text-foreground">
              {CN_NUM[si]}、{sec.title}
            </div>
            <div className="divide-y divide-border">
              {sec.questionIds.map((id, i) => {
                const q = lookup(id)
                if (!q) return null
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

/* ---------------------------- 题型及排序面板（拖拽 + 自定义大题） ---------------------------- */

function OrderPanel({
  sections,
  lookup,
  drag,
  setDrag,
  reorderSections,
  moveQuestion,
  renameSection,
  deleteSection,
  toggleCollapse,
  addSection,
}: {
  sections: Section[]
  lookup: (id: string) => Question | undefined
  drag: DragState
  setDrag: (d: DragState) => void
  reorderSections: (fromId: string, toId: string) => void
  moveQuestion: (qId: string, targetSecId: string, targetQId: string | null) => void
  renameSection: (id: string, title: string) => void
  deleteSection: (id: string) => void
  toggleCollapse: (id: string) => void
  addSection: () => void
}) {
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        拖拽 <GripVertical className="inline size-3" /> 调整大题或小题顺序；可重命名、收起、删除（仅限空大题），或新增自定义大题。
      </p>

      {sections.map((sec, si) => (
        <div
          key={sec.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (drag?.kind === "sec" && drag.id !== sec.id) reorderSections(drag.id, sec.id)
            else if (drag?.kind === "q") moveQuestion(drag.id, sec.id, null)
            setDrag(null)
          }}
          className={cn(
            "rounded-lg border border-border",
            drag?.kind === "sec" && drag.id === sec.id && "opacity-40",
          )}
        >
          {/* 大题头 */}
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-2.5 py-2">
            <span
              draggable
              onDragStart={() => setDrag({ kind: "sec", id: sec.id })}
              onDragEnd={() => setDrag(null)}
              className="cursor-grab text-muted-foreground/60 active:cursor-grabbing"
              title="拖拽调整大题顺序"
            >
              <GripVertical className="size-4" />
            </span>
            <button
              onClick={() => toggleCollapse(sec.id)}
              className="rounded p-0.5 text-muted-foreground transition hover:text-foreground"
              aria-label={sec.collapsed ? "展开" : "收起"}
            >
              <ChevronDown className={cn("size-3.5 transition", sec.collapsed && "-rotate-90")} />
            </button>
            <span className="shrink-0 text-[13px] font-semibold text-foreground">{CN_NUM[si]}、</span>
            {editing === sec.id ? (
              <input
                autoFocus
                value={sec.title}
                onChange={(e) => renameSection(sec.id, e.target.value)}
                onBlur={() => setEditing(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) setEditing(null)
                }}
                className="min-w-0 flex-1 rounded border border-brand bg-card px-1.5 py-0.5 text-[13px] font-semibold text-foreground outline-none"
              />
            ) : (
              <button
                onClick={() => setEditing(sec.id)}
                className="group flex min-w-0 flex-1 items-center gap-1 text-left text-[13px] font-semibold text-foreground"
                title="点击重命名"
              >
                <span className="truncate">{sec.title}</span>
                <Pencil className="size-3 shrink-0 text-muted-foreground/50 opacity-0 transition group-hover:opacity-100" />
              </button>
            )}
            <span className="shrink-0 text-xs font-normal text-muted-foreground">{sec.questionIds.length} 题</span>
            <button
              onClick={() => deleteSection(sec.id)}
              disabled={sec.questionIds.length > 0}
              title={sec.questionIds.length > 0 ? "请先移出该大题下的题目" : "删除大题"}
              className="rounded p-1 text-muted-foreground transition hover:bg-card hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-muted-foreground"
              aria-label="删除大题"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>

          {/* 小题列表 */}
          {!sec.collapsed && (
            <div className="divide-y divide-border">
              {sec.questionIds.length === 0 && (
                <div className="px-3 py-3 text-center text-xs text-muted-foreground">拖拽题目到此大题</div>
              )}
              {sec.questionIds.map((id, i) => {
                const q = lookup(id)
                if (!q) return null
                return (
                  <div
                    key={id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation()
                      if (drag?.kind === "q" && drag.id !== id) moveQuestion(drag.id, sec.id, id)
                      setDrag(null)
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2",
                      drag?.kind === "q" && drag.id === id && "opacity-40",
                    )}
                  >
                    <span
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation()
                        setDrag({ kind: "q", id })
                      }}
                      onDragEnd={() => setDrag(null)}
                      className="cursor-grab text-muted-foreground/60 active:cursor-grabbing"
                      title="拖拽调整顺序"
                    >
                      <GripVertical className="size-3.5" />
                    </span>
                    <span className="w-4 shrink-0 text-xs font-medium text-muted-foreground">{i + 1}.</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{q.short}</span>
                    <span className="shrink-0 rounded bg-brand-soft px-1.5 py-0.5 text-[11px] text-brand-soft-foreground">{q.qType}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addSection}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-[13px] font-medium text-muted-foreground transition hover:border-brand hover:text-brand"
      >
        <Plus className="size-4" />
        新增自定义大题
      </button>
    </div>
  )
}

/* ---------------------------- 跟进练习选题弹窗 ---------------------------- */

function QuestionPickerModal({
  anchor,
  exclude,
  onClose,
  onConfirm,
}: {
  anchor: Question
  exclude: string[]
  onClose: () => void
  onConfirm: (ids: string[]) => void
}) {
  const [picked, setPicked] = useState<string[]>([])
  const [kw, setKw] = useState("")

  const candidates = bank.filter((q) => {
    if (exclude.includes(q.id)) return false
    if (kw && !q.short.includes(kw)) return false
    return true
  })
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-label="关闭" />
      <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <ListPlus className="size-4 text-brand" />
              添加跟进练习
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">为「{anchor.short}」从题库选择巩固题</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* 搜索 */}
        <div className="border-b border-border px-5 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="搜索题库题目…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* 候选题 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          <div className="flex flex-col gap-2">
            {candidates.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">没有匹配的题目</p>
            )}
            {candidates.map((q) => {
              const on = picked.includes(q.id)
              return (
                <button
                  key={q.id}
                  onClick={() => toggle(q.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                    on ? "border-brand bg-brand-soft/40" : "border-border hover:border-brand/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded border",
                      on ? "border-brand bg-brand text-brand-foreground" : "border-muted-foreground/40",
                    )}
                  >
                    {on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{q.stem}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded bg-brand-soft px-1.5 py-0.5 font-medium text-brand-soft-foreground">{q.qType}</span>
                      <SourceBadge level={q.level} />
                      <span className={cn("rounded px-1.5 py-0.5 font-medium", diffStyle[q.difficulty])}>{q.difficulty}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <span className="text-sm text-muted-foreground">已选 <span className="font-semibold text-foreground">{picked.length}</span> 题</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
              取消
            </button>
            <button
              onClick={() => onConfirm(picked)}
              disabled={picked.length === 0}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              添加为跟进练习
            </button>
          </div>
        </div>
      </div>
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
