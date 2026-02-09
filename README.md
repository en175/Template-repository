# B端系统模板（Vue3 + Vite + Element Plus）

这是一套“可复刻的开发模式”模板：固定技术栈、固定分层与目录、固定页面骨架（筛选-表格-分页-详情抽屉-编辑弹窗）、固定本地 Mock 与真实接口切换、固定 Netlify 部署方式。

## 适用范围

- PC 端 B 端系统原型 / Demo / 轻量后台
- 你希望每个新项目都沿用同一套开发流程与结构

## 开始使用（本地）

```bash
npm install
npm run dev
```

默认端口：8897

## 如何从模板生成一个新项目

1. 打开模板仓库页面 → 点 “使用此模板” → 创建新仓库
2. 在新仓库点绿色按钮 “Code” → 复制仓库地址 → 本地 `git clone`
3. 进入项目目录执行：`npm install` → `npm run dev`

## 一键变成你的新项目（推荐流程）

1. 在 GitHub 创建一个新仓库（未来会把它设置为 Template repository）
2. 把本目录内容作为仓库根目录提交
3. 在 GitHub 仓库 Settings 里勾选 “Template repository”
4. 以后点 “Use this template” 创建新项目仓库

## 部署为可分享链接（Netlify）

- 推荐：Netlify 选择 “Import an existing project”，关联你的 Git 仓库即可自动构建
- 本模板已内置：
  - `netlify.toml`：构建命令 `npm run build`，发布目录 `dist`
  - `public/_redirects`：避免刷新/直达子路由 404（SPA 必备）

## 目录结构（约定）

```text
src/
  api/            业务接口封装（可切换 mock / 真实接口）
  components/     通用组件（空态、表格小组件等）
  data/           mock 数据与字典（状态枚举等）
  layouts/        通用布局骨架（顶栏/内容区）
  router/         路由
  services/       通用服务（http、运行时开关等）
  styles/         设计变量与全局样式（tokens/base/components）
  views/          页面模块（按业务域拆分）
```

## 页面开发模式（固定流程）

每个模块页面建议统一成以下结构：

- 顶部：页面标题 + 关键操作（新增/导出/批量）
- 中部：筛选区（搜索/下拉/日期）+ 表格（操作列）
- 底部：分页
- 右侧：详情抽屉（展示字段 + 快捷操作）
- 弹窗：新增/编辑表单（校验、loading、成功/失败提示）

模板示例页面：`src/views/RecordsView.vue`

## Mock / 真实接口切换

右上角开关可以切换：

- Mock：走 `src/api/*` 中的内存数据实现（用于快速演示）
- API：走 `fetch('/api/...')`（用于接入真实后端）

接真实接口时，建议保持 `src/api/*` 的函数签名不变，只替换内部实现。

## 扩展建议（按需）

- 角色权限：可在 `services/` 增加 `acl`，用 “权限码 + 数据范围” 统一控制按钮可见与可编辑
- 代码生成：后续可以引入 plop 生成 “列表页+详情抽屉+表单弹窗+mock+路由”
