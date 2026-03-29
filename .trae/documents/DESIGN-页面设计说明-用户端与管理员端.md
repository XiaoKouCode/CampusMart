基于现有后端接口的桌面优先（Desktop-first）页面设计说明，重点覆盖核心页面结构、组件与交互状态。

## 全局样式（Global Styles）
- 栅格与布局：内容区最大宽度 1200px；页面常用为「顶部导航 + 主内容」；详情页用双栏布局。
- 颜色：背景 #F7F8FA；主色 #1677FF；危险 #FF4D4F；成功 #52C41A；文字 #1F1F1F/#666。
- 字体：14px 基础字号；标题 20/24/28；行高 1.5。
- 组件：按钮（primary/secondary/danger，hover 变深 8%）；卡片（圆角 8px、阴影 1 层）；表格/列表统一空态/加载态。
- 认证态：右上角展示「登录/注册」或「头像/昵称 + 退出」；全局拦截 401/403。

---

## 1) 商品浏览页（/）
### Meta Information
- Title：校园二手交易平台 - 商品浏览
- Description：浏览与筛选校园二手商品

### Layout
- 顶部导航（固定）：Logo、搜索框、发布入口、订单入口、个人中心入口。
- 主区：筛选栏 + 商品卡片网格（CSS Grid：4 列；<1024px 2 列；<640px 1 列）。

### Sections & Components
1. 搜索与筛选区
   - 输入框：keyword
   - 下拉/输入：category、minPrice、maxPrice、publishAfter
   - 操作：查询/重置（触发 GET /api/items，带 page/size/sortBy）
2. 商品列表
   - 卡片：封面（imageUrls 第一张或占位图）、标题、价格、分类、成色、卖家昵称、信用分、发布时间
   - 状态角标：ONLINE/PENDING_REVIEW/OFFLINE/SOLD（非 ONLINE 可置灰不可下单）
3. 分页与排序
   - 分页控件：page/size
   - 排序选择：sortBy（默认 createdAt）

---

## 2) 商品详情页（/items/:id）
### Meta Information
- Title：商品详情
- Description：查看商品详情并发起交易/沟通

### Layout
- 双栏：左侧图片画廊（Carousel），右侧信息与操作（Flex 列）。

### Sections & Components
1. 商品信息
   - 标题、价格、分类、成色、发布时间、描述
2. 卖家信息
   - 卖家昵称、信用分；按钮：进入聊天（跳转 /chat/:sellerId）
3. 操作区
   - 下单按钮：POST /api/orders（未登录先跳转 /auth；非 ONLINE 禁用）
   - 举报按钮：打开弹窗填写 reason（POST /api/reports，targetItemId=当前商品）

---

## 3) 登录与注册页（/auth）
### Meta Information
- Title：登录/注册
- Description：完成账号认证

### Layout
- 居中卡片（宽 420px），Tab：登录/注册。

### Sections & Components
1. 登录表单
   - email + password；提交 POST /api/auth/login
2. 注册表单
   - studentNo、nickname、email、phone、password；提交 POST /api/auth/register
3. 成功态
   - 保存 token；拉取 /api/users/me 作为登录态校验；回跳来源页

---

## 4) 发布商品页（/publish，需登录）
### Meta Information
- Title：发布商品
- Description：发布二手商品，等待审核

### Layout
- 表单页（左右两列或单列）：左侧基础信息，右侧图片与提交。

### Sections & Components
- 字段：title、description、price、conditionLevel、category
- 图片：imageUrls（多行输入，约定用逗号分隔 URL；前端预览缩略图）
- 提交：POST /api/items；成功提示“发布成功，等待审核”并跳转订单/首页

---

## 5) 订单中心页（/orders，需登录）
### Meta Information
- Title：订单中心
- Description：管理买卖双方订单与交易流程

### Layout
- 顶部：视角切换 Tab（买家/卖家） + 状态筛选；主体：表格/列表。

### Sections & Components
1. 订单列表
   - 买家：GET /api/orders/buyer?status=…
   - 卖家：GET /api/orders/seller?status=…
2. 订单操作（根据 OrderStatus 渲染按钮）
   - PENDING_PAYMENT：买家可“支付”（PATCH /pay）、“取消”（PATCH /cancel）
   - FUNDS_HELD / WAITING_SELLER_CONFIRM：卖家可“确认交易”（PATCH /seller-confirm）
   - WAITING_BUYER_RECEIVE：买家可“确认收货”（PATCH /buyer-receive）
   - COMPLETED：显示“已完成”；入口“评价”（弹窗 POST /api/reviews）
3. 评价弹窗
   - level（GOOD/NEUTRAL/BAD）+ content

---

## 6) 聊天页（/chat/:peerUserId，需登录）
### Meta Information
- Title：聊天
- Description：与对方进行即时沟通

### Layout
- 单会话页面：顶部显示对方信息；中间消息流；底部输入框。

### Sections & Components
1. 历史消息
   - 进入页即请求 GET /api/chat/history/{peerUserId}
2. 发送消息
   - 发送按钮：默认走 POST /api/chat/send（receiverId=peerUserId，itemId 可选）
   - 同时可启用 WebSocket：连接 /ws/chat，发送到 /app/chat.send
3. 接收推送
   - 订阅 /user/queue/messages；收到后追加到消息流并高亮未读

---

## 7) 个人中心页（/profile，需登录）
### Meta Information
- Title：个人中心
- Description：查看与编辑个人资料

### Layout
- 左侧信息卡 + 右侧编辑表单（或单列）。

### Sections & Components
- 资料展示：GET /api/users/me
- 编辑保存：PATCH /api/users/me（表单校验 + 成功 toast）

---

## 8) 管理员端

### 8.1 管理员登录页（/admin/login）
- 与 /auth 类似，但登录成功后需要校验管理员身份：
  - 方式一（推荐）：后端 token 中携带角色（前端解码判断）。
  - 方式二（最小改动）：调用任一 /api/admin/**，403 则提示“非管理员”。

### 8.2 管理后台页（/admin，需管理员）
#### Layout
- 左侧侧边栏 + 右侧内容区（典型后台 Dashboard）。

#### Sections & Components
1. 统计概览
   - 统计卡片：GET /api/admin/stats
2. 商品审核/下架（有列表接口）
   - 状态筛选：ItemStatus（PENDING_REVIEW/ONLINE/OFFLINE/SOLD）
   - 列表：GET /api/admin/items?status=…
   - 操作：审核通过（PATCH /api/admin/items/{id}/approve）；下架（PATCH /api/admin/items/{id}/offline）
3. 用户状态（按 ID 工具型页面）
   - 输入：userId + enabled 开关；提交 PATCH /api/admin/users/{id}/status
4. 举报处理（按 ID 工具型页面）
   - 输入：reportId + status（OPEN/RESOLVED/REJECTED）+ remark；提交 PATCH /api/admin/reports/{id}

> 备注：由于后端未提供“用户列表/举报列表”查询接口，后台暂以“按 ID 处理”为主；如需要完整管理体验，需补充列表查询 API 后再扩展对应页面。
