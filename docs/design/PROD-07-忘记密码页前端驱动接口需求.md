# PROD-07-忘记密码页前端驱动接口需求（OneCRM）

## 1. 文档目的
- 本文档用于定义忘记密码页面（Forget Password）所需的后端接口能力。
- 遵循"前端驱动"模式，基于 `forgetpass.html` 的交互逻辑。

## 2. 需求单基础信息
- 需求标题：忘记密码功能接口定义
- 需求编号：PROD-07
- 提交人（前端）：Agent-Antigravity
- 对应页面：`/forgetpass.html`

## 3. 页面驱动说明

### 3.1 页面来源
- 来源类型：`HTML 原型`
- 证据路径：`forgetpass.html`

### 3.2 用户交互流
1. **发起请求**：
   - 用户在页面输入注册邮箱。
   - 点击"发送重置链接"。
   - 页面请求 `POST /api/auth/password/reset-link`。
2. **处理响应**：
   - **成功**：后端返回 200，前端显示统一提示"链接已发送"。
   - **失败**：根据错误码显示格式错误或限流提示。

> [!IMPORTANT]
> **安全策略**：采用"统一成功响应"，无论邮箱是否注册均返回 `200 OK`，避免账号枚举攻击。

## 4. 接口清单

### 4.1 接口：发送重置密码链接
- 接口名称：Request Password Reset Link
- 方法与路径：`POST /api/auth/password/reset-link`
- 调用时机：用户点击发送按钮时。
- 幂等要求：`否`
- 超时要求：`5s` (涉及邮件发送)

#### 请求定义
- Header：`Content-Type: application/json`
- Body（JSON）：
```json
{
  "email": "user@example.com"
}
```

#### 字段约束
| 字段 | 必填 | 最大长度 | Trim 规则 | 格式校验 |
|------|------|----------|-----------|----------|
| `email` | 是 | 255 | 自动 Trim | RFC 5322 标准 |

#### 成功响应
- **关键设计**：无论邮箱是否注册，均返回相同响应（防枚举）。
```json
{
  "status": "success",
  "data": null
}
```

#### 错误响应
| HTTP 状态码 | 业务码 | 前端提示文案 | 是否可重试 |
|---|---|---|---|
| 400 | `AUTH_EMAIL_REQUIRED` | 请输入有效的邮箱地址 | 是 |
| 400 | `AUTH_EMAIL_INVALID` | 邮箱格式不正确 | 是 |
| 429 | `AUTH_RATE_LIMITED` | 发送过于频繁，请稍后再试 | 否（见下方 retryAfterSeconds） |
| 500 | `SYS_INTERNAL_ERROR` | 系统繁忙，请稍后再试 | 是（重试 1 次） |
| 503 | `SYS_MAINTENANCE` | 系统维护中 | 否（阻断页面） |

#### 429 响应扩展
- 限流响应需包含倒计时信息，前端据此显示可重试时间：
```json
{
  "status": "error",
  "error_code": "AUTH_RATE_LIMITED",
  "message": "发送过于频繁，请稍后再试",
  "retryAfterSeconds": 600
}
```

## 5. 权限与安全

### 5.1 鉴权方式
- 公开接口 (Public)，无需登录。

### 5.2 限流策略
- 单 IP 每小时限制 5 次，防止邮件轰炸。
- 超限后返回 `429` 及 `retryAfterSeconds` 字段。

### 5.3 审计要求
| 字段 | 记录方式 | 说明 |
|------|----------|------|
| `email_hash` | SHA-256 哈希 | 脱敏存储，仅用于安全分析 |
| `client_ip` | 原文 | 用于限流和溯源 |
| `status` | 原文 | success/error |
| `error_code` | 原文 | 若失败则记录 |
| `timestamp` | ISO8601 | 请求时间 |

> [!NOTE]
> 审计日志中 **禁止存储明文 email**，使用 SHA-256 哈希代替。

## 6. 验收标准
1. Given 任意邮箱（无论是否注册）, When 请求重置链接, Then 后端返回 `200 success`。
2. Given 邮箱格式错误, When 请求重置链接, Then 后端返回 `400 AUTH_EMAIL_INVALID`。
3. Given 连续频繁点击超过 5 次, When 请求重置链接, Then 后端返回 `429` 并包含 `retryAfterSeconds`。
4. Given 后端服务异常, When 请求重置链接, Then 返回 `500` 或 `503`。
