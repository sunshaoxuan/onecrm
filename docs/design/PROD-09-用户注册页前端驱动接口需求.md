# PROD-09-用户注册页前端驱动接口需求（OneCRM）

## 1. 文档目的
- 本文档定义用户注册页面所需的后端接口能力。
- 遵循"前端驱动"模式，基于 `register.html` 的交互逻辑。

## 2. 需求单基础信息
- 需求标题：用户注册功能接口定义
- 需求编号：PROD-09
- 提交人（前端）：Agent-Antigravity
- 对应页面：`/register.html`

## 3. 页面驱动说明

### 3.1 统一注册流程 (`register.html`)
1. **模式 A：自由注册**
   - 用户填写表单。
   - 请求 `POST /api/auth/register`。
2. **模式 B：SSO 注册（即登录）**
   - 用户点击 SSO 按钮。
   - 前端调用 `POST /api/auth/sso/init` 获取 `authUrl` 和 `state`。
   - 前端重定向到 IdP（如 Microsoft/Google）。
   - IdP 认证完成后重定向到**前端路由** `/sso/callback?code=xxx&state=xxx`。
   - 前端从 URL query 读取 `code` 和 `state`，调用 `POST /api/auth/sso/callback`。
   - 如果用户不存在，后端自动注册并返回 `isNewUser: true`。

> **SSO 回调模式冻结**：采用"前端中转模式"，IdP 重定向到前端路由，前端负责收集 `code`/`state` 后 POST 至后端。

---

## 4. 接口清单

### 4.1 接口：自由注册
- 接口名称：User Registration
- 方法与路径：`POST /api/auth/register`
- 调用时机：用户提交注册表单时
- 幂等要求：`否`
- 超时要求：`5s`

#### 请求定义
- Header：`Content-Type: application/json`
- Body（JSON）：
```json
{
  "name": "山田 太郎",
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "termsAccepted": true
}
```

#### 字段约束
| 字段 | 必填 | 最大长度 | 规则 |
|------|------|----------|------|
| `name` | 是 | 100 | 不能为空白，前后 trim |
| `email` | 是 | 255 | RFC 5322 格式，前后 trim + 小写化 |
| `password` | 是 | 128 | 最少 8 字符，不做修改 |
| `confirmPassword` | 是 | 128 | 必须与 password 一致 |
| `termsAccepted` | 是 | - | 必须为 true |

> **输入归一化规则冻结**：`email` 前后 trim + 小写化；`name` 前后 trim 保留原始大小写；`password` 不做任何修改。

#### 成功响应 (201 Created)
```json
{
  "status": "success",
  "data": {
    "userId": "usr_abc123",
    "email": "user@example.com",
    "requiresVerification": true
  }
}
```

> **注意**：`requiresVerification: true` 表示需要邮箱验证。验证流程将在 **PROD-11** 中定义。

#### 错误响应
| HTTP 状态码 | 业务码 | 前端提示文案 | 是否可重试 |
|---|---|---|---|
| 400 | `AUTH_MISSING_FIELD` | 必須項目を入力してください | 是 |
| 400 | `AUTH_PASSWORD_WEAK` | パスワードは8文字以上必要です | 是 |
| 400 | `AUTH_PASSWORD_MISMATCH` | パスワードが一致しません | 是 |
| 400 | `AUTH_TERMS_NOT_ACCEPTED` | 利用規約への同意が必要です | 是 |
| 409 | `AUTH_EMAIL_EXISTS` | このメールアドレスは既に登録されています | 否 |
| 429 | `AUTH_REGISTER_RATE_LIMITED` | 登録リクエストが多すぎます | 否 |
| 500 | `SYS_INTERNAL_ERROR` | システムエラーが発生しました | 是 |

**429 响应体结构**（与 PROD-07/08 保持一致）：
```json
{
  "status": "error",
  "error_code": "AUTH_REGISTER_RATE_LIMITED",
  "message": "AUTH_REGISTER_RATE_LIMITED",
  "retryAfterSeconds": 600
}
```

---

### 4.2 接口：SSO 初始化
- 接口名称：SSO Init
- 方法与路径：`POST /api/auth/sso/init`
- 调用时机：用户点击 SSO 按钮时
- 幂等要求：`是`

#### 请求定义
```json
{
  "provider": "microsoft",
  "redirectUri": "https://app.onecrm.com/sso/callback"
}
```

| provider 值 | 说明 |
|-------------|------|
| `microsoft` | Microsoft 365 / Azure AD |
| `google` | Google Workspace |

#### 成功响应 (200 OK)
```json
{
  "status": "success",
  "data": {
    "authUrl": "https://login.microsoftonline.com/...",
    "state": "random-state-token"
  }
}
```

#### 错误响应
| HTTP 状态码 | 业务码 | 说明 | 是否可重试 |
|---|---|---|---|
| 400 | `AUTH_SSO_MISSING_PROVIDER` | provider 参数缺失 | 是 |
| 400 | `AUTH_SSO_UNSUPPORTED_PROVIDER` | provider 不在支持列表 | 否 |
| 429 | `AUTH_SSO_RATE_LIMITED` | 请求过于频繁 | 否 |
| 500 | `SYS_INTERNAL_ERROR` | IdP 通信失败或配置异常 | 是 |

---

### 4.3 接口：SSO 回调
- 接口名称：SSO Callback
- 方法与路径：`POST /api/auth/sso/callback`
- 调用时机：前端从 IdP 重定向收到 `code`/`state` 后调用

> **调用流程**：IdP 重定向到前端路由 `/sso/callback?code=xxx&state=xxx`，前端读取 query 参数后调用本接口。

#### 请求定义
```json
{
  "provider": "microsoft",
  "code": "auth-code-from-idp",
  "state": "random-state-token"
}
```

#### 成功响应 (200 OK)
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "dGhpcyBpcyBh...",
    "user": {
      "id": "usr_abc123",
      "name": "山田 太郎",
      "email": "user@company.com",
      "avatar": null
    },
    "isNewUser": true
  }
}
```

#### 错误响应
| HTTP 状态码 | 业务码 | 说明 | 是否可重试 |
|---|---|---|---|
| 400 | `AUTH_SSO_MISSING_FIELD` | code/state/provider 参数缺失 | 是 |
| 400 | `AUTH_SSO_INVALID_STATE` | State 不匹配（CSRF 保护） | 否 |
| 400 | `AUTH_SSO_CODE_EXPIRED` | 授权码已过期 | 否 |
| 403 | `AUTH_SSO_DOMAIN_NOT_ALLOWED` | 企业域名未授权 | 否 |
| 500 | `AUTH_SSO_PROVIDER_ERROR` | IdP 返回错误 | 是 |

---

## 5. 权限与安全

### 5.1 鉴权方式
- 自由注册和 SSO 初始化：公开接口 (Public)
- SSO 回调：需验证 state 参数

### 5.2 SSO 安全参数规范
| 参数 | 要求 | 说明 |
|------|------|------|
| `state` | **必须校验** | 用于防止 CSRF 攻击 |
| `PKCE` | 本期不强制 | 未来可选扩展 |
| `nonce` | 仅 OIDC 场景 | 当前 OAuth 2.0 不强制 |

### 5.3 限流策略
| 接口 | 限制 | 429 错误码 |
|------|------|------------|
| 自由注册 | 单 IP 每小时 10 次 | `AUTH_REGISTER_RATE_LIMITED` |
| SSO 初始化 | 单 IP 每分钟 20 次 | `AUTH_SSO_RATE_LIMITED` |

### 5.4 审计要求
| 字段 | 记录方式 |
|------|----------|
| `email_hash` | SHA-256 哈希 |
| `client_ip` | 原文 |
| `provider` | 原文（SSO） |
| `status` | success/error |
| `timestamp` | ISO8601 |

---

## 6. 验收标准
1. Given 有效注册信息, When 提交表单, Then 返回 201 和 userId。
2. Given 已存在邮箱, When 注册, Then 返回 409 AUTH_EMAIL_EXISTS。
3. Given 密码不匹配, When 注册, Then 返回 400 AUTH_PASSWORD_MISMATCH。
4. Given 选择 SSO, When 点击按钮, Then 返回 authUrl 并前端重定向至 IdP。
5. Given SSO 认证成功, When 前端调用 callback, Then 返回 Token 和用户信息。
6. Given 超过限流阈值, When 再次请求, Then 返回 429 并包含 retryAfterSeconds。
7. Given SSO state 不匹配, When 回调, Then 返回 400 AUTH_SSO_INVALID_STATE。

---

## 7. 待定事项
- **PROD-11**：邮箱验证流程（验证链接回调 / 重发验证邮件 / 验证状态查询）。
