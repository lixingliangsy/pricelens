# WorkBuddy 派发任务简报

> 项目目录：`E:/AgentCPM/07_一人公司出海项目/12_Micro_SaaS出海/pricelens`
> 本文件由 WorkBuddy（一人公司专家团·总指挥）自动派发。
> **执行方式**：用对应 IDE（Cursor / Trae / CodeBuddy）打开本项目，启动其内置 AI Agent / Composer，将下方任务交给它执行；完成后回到 WorkBuddy 做构建与验收。


---
### 📋 任务简报 @ 2026-07-09 21:26
**generate_code**

- 目标工具/语言：Next.js (Pages Router) + TypeScript + Stripe
- 任务描述：
为产品 pricelens（定价页拆解工具）实现 Stripe 订阅收银集成，使其具备真实验收能力（用于验证一人公司付费闭环）：
1. 新增 pages/api/checkout.js：POST 接收 {plan:'pro'|'team'}，用 stripe SDK 创建 Checkout Session；Pro=$19/月、Team=$49/月（价格用 env STRIPE_PRICE_PRO / STRIPE_PRICE_TEAM，未配置时回退到用金额+货币创建一次性/订阅 session）；密钥用 env STRIPE_SECRET_KEY。返回 {url}。
2. 新增 .env.example，列出 STRIPE_SECRET_KEY / STRIPE_PRICE_PRO / STRIPE_PRICE_TEAM / STRIPE_WEBHOOK_SECRET。
3. 在首页或定价区增加 'Upgrade to Pro' / 'Upgrade to Team' 按钮，点击 fetch('/api/checkout') 后跳转返回的 url。
4. 新增 pages/api/webhook.js：校验 Stripe 签名（STRIPE_WEBHOOK_SECRET），用内存 Map 记录订阅状态，核心处标注 TODO 接 DB。
5. 仅新增 'stripe' 一个依赖；`npm run build` 必须通过；缺少密钥时接口返回清晰错误 JSON 而非崩溃。

- 验收标准：
  1. 代码可运行、通过类型检查与 `npm run build`
  2. 不引入任务以外的依赖（必要新增须说明）
  3. 核心逻辑不留占位 TODO；仅在需外部密钥/DB 处标注 TODO 并附 `.env.example`
  4. 改动保持与现有 Next.js Pages Router 结构一致


---
### 📋 任务简报 @ 2026-07-09 22:48
**generate_code**

- 目标工具/语言：Next.js (Pages Router) + TypeScript
- 任务描述：
为 pricelens 增加测试与发布质量加固（在现有 Stripe 收银集成之上，不要改动已实现的 /api/checkout、/api/webhook、Pricing 组件）：
1. 新增 scripts/smoke.mjs：用 child_process 启动 `next start -p 3123`，启动后依次 curl：
   - POST /api/tool (body {inputs:{},useMock:true}) 断言返回 200 且含 'result'；
   - POST /api/checkout (body {plan:'pro'}) 断言返回 400 且含 'Stripe not configured'（无密钥时的预期行为）。
   完成后 kill 进程。在 package.json 加脚本 "test:smoke": "node scripts/smoke.mjs"。
2. 新增 public/pricing.html（静态页，含 PRODUCT 三档定价），让页脚 Pricing 链接不再 404。
3. `npm run build` 必须通过；不引入任务以外的依赖。

- 验收标准：
  1. 代码可运行、通过类型检查与 `npm run build`
  2. 不引入任务以外的依赖（必要新增须说明）
  3. 核心逻辑不留占位 TODO；仅在需外部密钥/DB 处标注 TODO 并附 `.env.example`
  4. 改动保持与现有 Next.js Pages Router 结构一致
