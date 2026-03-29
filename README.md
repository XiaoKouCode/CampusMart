# 基于Spring Boot的校园二手交易平台

## 项目说明

本项目实现了校园二手交易平台的核心能力：

- 用户注册登录、JWT无状态认证、BCrypt密码加密
- 校园身份校验（`.edu.cn`邮箱识别）与信用分体系
- 商品发布、审核、搜索筛选、分页排序
- 订单担保交易流程（下单→暂扣款→卖家确认→买家收货→完成）
- 即时沟通（WebSocket + REST）与评价系统
- 举报处理、管理员后台管理、基础数据统计
- Redis优先缓存 + 本地缓存降级、限流、防刷与简单熔断降级

## 技术栈

- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA + H2/MySQL
- Redis Cache
- WebSocket(STOMP)
- Bucket4j 限流

## 默认账号

- 管理员邮箱：`admin@campus.edu.cn`
- 管理员密码：`Admin@123`

## 关键接口

### 认证与用户
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PATCH /api/users/me`

### 商品
- `POST /api/items`
- `GET /api/items`
- `GET /api/items/{id}`

### 订单
- `POST /api/orders`
- `PATCH /api/orders/{id}/pay`
- `PATCH /api/orders/{id}/seller-confirm`
- `PATCH /api/orders/{id}/buyer-receive`
- `PATCH /api/orders/{id}/cancel`
- `GET /api/orders/buyer`
- `GET /api/orders/seller`

### 聊天与评价
- `POST /api/chat/send`
- `GET /api/chat/history/{userId}`
- WebSocket 端点：`/ws/chat`
- STOMP发送：`/app/chat.send`
- `POST /api/reviews`

### 举报与后台
- `POST /api/reports`
- `PATCH /api/admin/users/{id}/status`
- `PATCH /api/admin/items/{id}/approve`
- `PATCH /api/admin/items/{id}/offline`
- `GET /api/admin/items`
- `PATCH /api/admin/reports/{id}`
- `GET /api/admin/stats`

## 配置说明

- 默认使用 H2 内存数据库，便于本地快速启动
- Redis可用时使用Redis缓存，不可用时自动回退到本地缓存
- 限流配置位于：
  - `app.rate-limit.login-per-minute`
  - `app.rate-limit.order-per-minute`

## 启动

1. 配置JDK 17并设置`JAVA_HOME`
2. 执行：`mvn spring-boot:run`
