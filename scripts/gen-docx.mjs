import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { imageSize } from "image-size"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
} from "docx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const PRD = path.join(ROOT, "public", "prd")

const GREEN = "2E7D5B"
const DARK = "1F2937"
const GRAY = "6B7280"

/* 读取图片并按最大宽度等比缩放（EMU 基于像素，Word 默认 96dpi） */
function img(file, maxW = 600) {
  const p = path.join(PRD, file)
  const buf = fs.readFileSync(p)
  const { width, height } = imageSize(buf)
  const w = Math.min(maxW, width)
  const h = Math.round((height / width) * w)
  return new ImageRun({ data: buf, transformation: { width: w, height: h } })
}

/* 单张大图（居中） */
function figure(file, caption, maxW = 620) {
  const out = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 }, children: [img(file, maxW)] }),
  ]
  if (caption) {
    out.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: caption, italics: true, size: 18, color: GRAY })],
      }),
    )
  }
  return out
}

/* 两张/三张图并排对比 */
function compareFigure(items, maxW = 300) {
  const cellW = Math.floor(100 / items.length)
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
  const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }
  const row = new TableRow({
    children: items.map(
      (it) =>
        new TableCell({
          width: { size: cellW, type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [img(it.file, maxW)] })],
        }),
    ),
  })
  const capRow = new TableRow({
    children: items.map(
      (it) =>
        new TableCell({
          width: { size: cellW, type: WidthType.PERCENTAGE },
          borders,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: it.caption, italics: true, size: 18, color: GRAY })],
            }),
          ],
        }),
    ),
  })
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
      rows: [row, capRow],
    }),
    new Paragraph({ spacing: { after: 160 }, children: [] }),
  ]
}

const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 }, children: [new TextRun({ text: t, bold: true, color: GREEN, size: 30 })] })
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 }, children: [new TextRun({ text: t, bold: true, color: DARK, size: 25 })] })
const label = () => new Paragraph({ spacing: { before: 80, after: 60 }, children: [new TextRun({ text: "需求说明", bold: true, color: GREEN, size: 22 })] })
const body = (t) => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: t, size: 21, color: DARK })] })
/* 支持一层缩进的项目符号；level 0/1 */
function bullet(runs, level = 0) {
  const arr = Array.isArray(runs) ? runs : [{ text: runs }]
  return new Paragraph({
    bullet: { level },
    spacing: { after: 40 },
    children: arr.map((r) => new TextRun({ text: r.text, bold: !!r.bold, size: 21, color: r.color || DARK })),
  })
}

const children = []

/* ---------- 封面 ---------- */
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 120 }, children: [new TextRun({ text: "点这笔 · 资源平台需求文档", bold: true, size: 52, color: GREEN })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "有我知了 · 教学评一体化 AI 空间 —— 资源模块", size: 26, color: DARK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "版本 v2.0", size: 22, color: GRAY })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "本文按功能点组织，每个功能点包含界面截图与需求说明。截图为原型真实界面。", size: 20, color: GRAY })] }),
  new Paragraph({ children: [new PageBreak()] }),
)

/* ---------- 1 全局框架 ---------- */
children.push(h1("1. 全局框架与导航"))
children.push(...figure("01-resource-home.png", "图 1 资源平台首页"))
children.push(label())
children.push(
  bullet("采用「左侧一级导航 + 顶栏 + 主工作区」的三段式布局。"),
  bullet("左侧一级导航固定为：首页、备课、教学、作业、错题、学情、资源、管理；当前模块「资源」高亮。"),
  bullet("顶栏展示产品名「有我知了 · 教学评一体化AI空间」、学校（有我初中）、教师账号（xh200）、学科切换（数学）、通知与安全入口。"),
  bullet("主工作区左栏为教材与章节导航，右栏为资源列表；整体绿色主题色，符合教育场景稳重、清晰的调性。"),
)

/* ---------- 2 资源库检索 ---------- */
children.push(h1("2. 资源库检索"))

children.push(h2("2.1 教材上下文与切换"))
children.push(...figure("04-textbook-switcher.png", "图 2 切换教材弹窗", 520))
children.push(label())
children.push(
  bullet("左栏顶部固定「教材卡」：显示当前教材封面、学科·版本（数学·沪教版）、年级学期（七年级下册·2025学年），并提供「切换教材 / 学期」入口。"),
  bullet("点击后弹出切换教材弹窗："),
  bullet("支持按学年（2025 / 2024 学年）与学期（上 / 下学期）切换；", 1),
  bullet("教材以封面网格展示，选中项右上角打勾并高亮描边；", 1),
  bullet("底部「取消 / 确定切换」，切换后资源列表按新教材上下文刷新。", 1),
)

children.push(h2("2.2 章节目录 / 知识点双视图"))
children.push(...compareFigure([
  { file: "01-resource-home.png", caption: "章节目录" },
  { file: "07-knowledge-tab.png", caption: "知识点" },
]))
children.push(label())
children.push(
  bullet("左栏提供「章节目录 / 知识点」两种组织维度，可一键切换。"),
  bullet([{ text: "章节目录：", bold: true }, { text: "按教材单元层级展开（如「第15章 一元一次不等式」下含 15.1 / 15.2 / 15.3），每个节点右侧显示题量；支持父节点展开/收起，子节点选中高亮。" }]),
  bullet([{ text: "知识点：", bold: true }, { text: "按知识领域组织（数与代数、图形与几何、综合与实践），下挂具体知识点及题量。" }]),
  bullet("选中某章节/知识点后，右侧列表联动过滤对应资源。"),
)

children.push(h2("2.3 来源与题型难度筛选"))
children.push(...figure("03-more-filters.png", "图 3 更多筛选展开"))
children.push(label())
children.push(
  bullet("列表顶部提供来源筛选：全部 / 市级 / 区级 / 校级 / 我的，用于区分题目的来源层级与归属。"),
  bullet("「更多筛选」展开后出现二级筛选：题型（全部/单选/多选/填空/判断/主观）与难度（全部/易/中/难）。"),
  bullet("右上角展示当前结果总数（如「共 5 题」）并提供列表 / 网格视图切换。"),
  bullet("顶部标签页可切换资源类型：题目 / 作业 / 备课 / 微课 / 精品。"),
  bullet("搜索框支持按题干、知识点、标签检索；右侧为「新增题目」主按钮。"),
)

children.push(h2("2.4 题目卡片与详情"))
children.push(...figure("02-question-expand.png", "图 4 题目展开详情"))
children.push(label())
children.push(
  bullet("每张题目卡片展示：序号、题型徽标、来源徽标（市/区/校）、难度、是否含视频讲解，以及题干（支持数学公式渲染）与选项。"),
  bullet("卡片底部展示知识点标签、教学用途等标签，右侧提供「展开详情 / 加入（题篮）」操作。"),
  bullet("展开详情后分「基本信息 / 系统标注」两个子页："),
  bullet("基本信息：显示【答案】【解析】（公式渲染），并关联讲解视频卡片（时长、播放入口）。", 1),
  bullet("卡片右上角显示使用数据（如「组卷 326 · 已练 1280 人」），辅助教师判断题目质量。"),
)

children.push(h2("2.5 试卷（作业）资源与预览"))
children.push(...compareFigure([
  { file: "05-paper-list.png", caption: "作业资源列表" },
  { file: "06-paper-detail.png", caption: "试卷预览" },
]))
children.push(label())
children.push(
  bullet("「作业」标签页展示成套试卷资源，每条显示：标题、来源、题量、难度区间、已布置班级数、使用次数与标签。"),
  bullet("每条提供「预览 / 布置作业」操作。"),
  bullet("预览进入试卷详情页：按大题分组渲染全部题目，含答案、讲解视频；顶部保留试卷元信息与「布置作业」入口，支持「返回资源列表」。"),
)

/* ---------- 3 新增题目 ---------- */
children.push(h1("3. 新增题目"))

children.push(h2("3.1 选择章节（第一步）"))
children.push(...figure("09-newq-step1.png", "图 5 新增题目 · 选择章节"))
children.push(label())
children.push(
  bullet("新增题目采用两步向导，顶部提供步骤条（1 选择章节 → 2 录入题目）。"),
  bullet("第一步先确定题目归属：展示当前学科上下文徽标（数学 / 七年级下 / 沪教版），选择单元（列表单选）与章节（标签单选）。"),
  bullet("完成后点击「下一步 · 录入题目」进入第二步。"),
)

children.push(h2("3.2 录入题目（第二步）"))
children.push(...figure("10-newq-step2.png", "图 6 新增题目 · 录入题目"))
children.push(label())
children.push(
  bullet("左侧主表单："),
  bullet("基础信息：显示已选章节徽标，可「返回修改章节」；题目类型支持单选/多选/判断/填空/主观/连线/组合题。", 1),
  bullet("核心内容：题干（必填，支持图片与公式）、答案选项（A/B/C/D）、解析（支持「AI 生成解析」）、难度（易/中/难）。", 1),
  bullet("讲解资源：可上传讲解视频、解析音频，或生成讲解脚本，沉淀为精品讲解资源。", 1),
  bullet("右侧为标签体系（见 3.3）。底部「保存题目」。"),
)

children.push(h2("3.3 标签体系与 AI 生成标签"))
children.push(...figure("11-newq-ai-tags.png", "图 7 AI 生成标签"))
children.push(label())
children.push(
  bullet("右栏标签体系采用受控词表，按命名空间分组：知识点（必填）、核心素养、认知层级、教学用途、情景属性、常见错因。"),
  bullet("每个分组可折叠，标签以点选方式增删，已选数量实时统计。"),
  bullet("支持「AI 生成标签」：点击后系统根据题干自动推荐并勾选标签（带 AI 标识），教师可二次调整，支持「重新生成」。"),
  bullet("底部支持自定义标签：输入后回车创建，补充受控词表之外的个性化标签。"),
)

/* ---------- 4 题篮与组卷 ---------- */
children.push(h1("4. 题篮与组卷"))

children.push(h2("4.1 题篮"))
children.push(...figure("08-cart-drawer.png", "图 8 题篮抽屉", 460))
children.push(label())
children.push(
  bullet("全局右下角悬浮「题篮」入口，带数量角标；点击从右侧滑出抽屉。"),
  bullet("题篮内按题型分组展示已选题目，每题显示题干摘要与来源/难度徽标，支持单题删除。"),
  bullet("底部提供「清空题篮」与「生成练习」主按钮，进入组卷编辑台。"),
)

children.push(h2("4.2 组卷编辑台"))
children.push(...figure("12-composer.png", "图 9 组卷编辑台"))
children.push(label())
children.push(
  bullet("顶部展示练习标题、题量、总分、布置对象数量，右侧「存为草稿 / 布置作业」。"),
  bullet("中间为试卷主体：按大题分组，题卡显示题型/来源/难度/分值、题干与选项，支持「展开详情 / 添加题目音频 / 添加跟进练习 / 移出」。"),
  bullet("右侧为工具轨（作业信息 / 分值设置 / 题型及排序）三个抽屉切换入口。"),
)

children.push(h2("4.3 作业信息 / 分值设置 / 题型及排序"))
children.push(...compareFigure([
  { file: "13-drawer-info.png", caption: "作业信息" },
  { file: "14-drawer-score.png", caption: "分值设置" },
  { file: "12-composer.png", caption: "题型及排序" },
], 200))
children.push(label())
children.push(
  bullet([{ text: "作业信息：", bold: true }, { text: "编辑练习名称、学科/教材（只读上下文）、布置对象（班级多选）、截止时间。" }]),
  bullet([{ text: "分值设置：", bold: true }, { text: "显示试卷总分；支持自动赋分（按题赋分 / 按问赋分，一键应用），并可对每道小题逐题微调分值，总分实时联动。" }]),
  bullet([{ text: "题型及排序：", bold: true }, { text: "以可拖拽列表管理大题与小题顺序；支持大题重命名、收起、删除，可「新增自定义大题」，题目可在大题间移动。" }]),
)

children.push(h2("4.4 题目音频与跟进练习"))
children.push(...compareFigure([
  { file: "15-audio-modal.png", caption: "添加题目音频" },
  { file: "16-followup-modal.png", caption: "添加跟进练习" },
]))
children.push(label())
children.push(
  bullet([{ text: "添加题目音频：", bold: true }, { text: "为单题挂载音频，提供三种方式——上传音频文件（mp3/m4a ≤ 20MB）、AI 智能朗读生成（按题干生成、可调语速音色）、从资源库选择。" }]),
  bullet([{ text: "添加跟进练习：", bold: true }, { text: "为指定题目从题库检索并选取巩固题，支持搜索、多选，底部实时统计「已选 N 题」并「添加为跟进练习」，形成分层/巩固链路。" }]),
)

/* ---------- 5 布置作业 ---------- */
children.push(h1("5. 布置作业"))
children.push(...compareFigure([
  { file: "17-publish-dialog.png", caption: "布置配置" },
  { file: "18-publish-success.png", caption: "布置成功" },
]))
children.push(label())
children.push(
  bullet("「布置作业」弹窗汇总练习信息（标题、题量、总分），并配置："),
  bullet("布置类型：点阵笔作业（纸质作答·自动归位识别）/ 电子作业（在线作答·直接布置）；", 1),
  bullet("纸张类型：A4（210×297mm）/ B3（353×500mm），仅点阵笔作业需要；", 1),
  bullet("布置班级：多选；", 1),
  bullet("布置时间：立即布置 / 指定时间。", 1),
  bullet("底部汇总布置范围（如「立即布置到 2 个班」）并「确认布置」。"),
  bullet("布置成功后弹出结果页：提示「点阵笔作业已创建」，引导「去框选」或「稍后再框选」。"),
)

/* ---------- 6 点阵笔排版框选 ---------- */
children.push(h1("6. 点阵笔排版框选"))

children.push(h2("6.1 框选主界面"))
children.push(...figure("19-dotpen-layout.png", "图 10 确认题目与作答区"))
children.push(label())
children.push(
  bullet("页面为「确认题目与作答区」，用于将点阵笔纸质卷面与题目结构进行绑定。"),
  bullet("顶栏：作业标题与切换、纸张尺寸（A4）、识别状态（如「已识别 5 题，2 处待确认」），以及保存 / 预览打印 / 下载PDF / 发布作业。"),
  bullet("中间为卷面画布：支持翻页（缩略图）、缩放、适宽、实际大小、旋转；卷面上以彩色框标出题目区（印刷题干）与作答区（手写作答）。"),
  bullet("左下角图例：题目区（蓝）/ 作答区（绿）/ 未框选·待确认（红）。"),
  bullet("右侧为「按题目查看 / 按层级查看」双视图。"),
)

children.push(h2("6.2 智能框选与手动框选（增 / 删）"))
children.push(label())
children.push(
  bullet([{ text: "AI 一键框选：", bold: true }, { text: "自动识别并生成题目区/作答区框。" }]),
  bullet("「显示全部框」开关：切换卷面框的显隐。"),
  bullet([{ text: "手动框选：", bold: true }, { text: "提供「题目框 / 小题框 / 作答框」三种绘制工具；选中工具后在卷面按住拖拽即可新增框。" }]),
  bullet([{ text: "删除：", bold: true }, { text: "每个框（含 AI 自动生成与手动绘制）在悬停时于右上角显示红色 ×，点击即删除该框。框选支持完整的增删闭环。" }]),
)

children.push(h2("6.3 按题目查看与题目配置"))
children.push(...compareFigure([
  { file: "19-dotpen-layout.png", caption: "按题目查看" },
  { file: "20-config-modal.png", caption: "题目信息配置" },
]))
children.push(label())
children.push(
  bullet("「按题目查看」以扁平列表呈现每道小题：序号、名称、题型、分值与状态（正常 / 待确认 / 作答区偏小 等异常提示）。"),
  bullet("点击某题打开题目信息配置弹窗：可设置该题分值、题型、答案（如单选唯一正确项），保存后回写卷面与列表。"),
  bullet("右上角「批量设置」入口与 6.5 一致（两个视图共用同一批量设置功能）。"),
)

children.push(h2("6.4 按层级查看（合并 / 拆分）"))
children.push(...figure("21-level-view.png", "图 11 按层级查看 · 题目层级", 420))
children.push(label())
children.push(
  bullet("「按层级查看」以题目层级树呈现结构：顶部统计「总分 / 大题数 / 小题数」。"),
  bullet("层级为：大题 → 小题 → 作答区。"),
  bullet("小题显示题号徽标、题型徽标；作答区显示答案徽标（客观题）与分值。", 1),
  bullet("支持合并 / 拆分："),
  bullet("小题左侧圆形「合」：与下一小题合并为多作答区结构；", 1),
  bullet("合并后的小题显示「拆」：可拆回独立小题；", 1),
  bullet("大题左侧圆形「合」：与下一大题合并；", 1),
  bullet("不可操作时显示灰色「−」。", 1),
  bullet("大题支持展开/收起。"),
)

children.push(h2("6.5 批量设置"))
children.push(...figure("22-batch-modal.png", "图 12 批量设置弹窗"))
children.push(label())
children.push(
  bullet("「按题目查看」与「按层级查看」右上角的「批量设置」为同一功能（非复选批量），打开统一的层级表格弹窗。"),
  bullet("弹窗以表格呈现全部小题，按大题分组，列为「题号 / 题型·答案 / 分值」："),
  bullet("支持在大题级设置题型与「每作答区分值」并一键下发；", 1),
  bullet("支持逐小题设置题型、逐作答区录入答案与分值；", 1),
  bullet("大题分值、试卷总分实时汇总。", 1),
  bullet("底部「取消 / 确定」，确定后统一回写各题配置。"),
)

const doc = new Document({
  creator: "点这笔",
  title: "点这笔 · 资源平台需求文档",
  styles: {
    default: {
      document: { run: { font: "Microsoft YaHei" } },
    },
  },
  sections: [
    {
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } },
      children,
    },
  ],
})

const outPath = path.join(ROOT, "docs", "资源平台需求文档.docx")
const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(outPath, buffer)
console.log("[v0] docx written:", outPath, (buffer.length / 1024).toFixed(0) + "KB")
