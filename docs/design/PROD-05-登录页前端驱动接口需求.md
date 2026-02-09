# PROD-05-登录页前端驱动接口需求（OneCRM）

## 1. 文档目的
- 本文档用于定义登录页面所需的后端接口能力。
- 遵循“前端驱动”模式，基于 `App.tsx` 和 `Login.razor` (参考) 的交互逻辑。

## 2. 使用规则
- 对应页面：`/login` (登录页)
- 优先级：`P0`
- 期望联调日期：2026-02-11
- 关联文档：
  - `PROD-06-登录页前端多语言词条需求.md`

## 3. 需求单基础信息
- 需求标题：登录与初始化接口
- 需求编号：REQ-API-2026-002
- 提交人（前端）：Agent-Antigravity
- 对应页面：`/login`

## 4. 页面驱动说明
### 4.1 页面来源
- 来源类型：`现网页面` (OneCRM v0.2.0)
- 证据路径：`src/App.tsx`

### 4.2 用户交互流
1. **初始化检查**：
   - 用户访问首页 `/`。
   - 页面静默请求 `GET /api/setup/admin` 检查系统是否初始化。
   - 若未初始化 (`exists: false`)，跳转 `/setup`。
   - 若已初始化且有本地 Token，调用 `GET /api/auth/me` 校验有效性。
   - 若 `me` 接口返回 401，尝试 `POST /api/auth/refresh` 刷新。
   - 若刷新失败，清除本地 Token 并停留在登录页。
2. **加载资源**：
   - 页面请求 `GET /api/i18n/resources` 获取当前语言包。
3. **用户登录**：
   - 用户输入用户名/密码，点击“登录”。
   - 页面请求 `POST /api/auth/login`。
   - **成功**：后端返回 Token 和用户信息，前端存储至 LocalStorage，跳转 `/`。
   - **失败**：后端返回 401/400 及错误信息，前端显示错误提示。

### 4.3 前端状态定义
- 首次加载态：显示骨架屏或 Loading (目前由 React Suspense 或父级控制)。
- 错误态：登录框上方显示红色错误条 (`.auth-message.error`)。
- 防重复提交：点击登录后，按钮进入 `loading` 态并禁用。

## 5. 接口清单

### 5.1 接口：系统初始化检查
- 接口名称：Check Admin Setup
- 方法与路径：`GET /api/setup/admin`
- 调用时机：`App` 组件挂载时 (`useEffect`)。
- 幂等要求：`是`
- 超时要求：`3s`
- 错误策略：超时或 500 时，前端**阻断进入**，显示 "System Unreachable" 全局错误页 (Fail-Safe)。

#### 响应定义
- 成功响应（JSON）：
```json
{
  "status": "success",
  "data": {
    "exists": true // true=已初始化, false=需跳转/setup
  }
}
```
- 错误响应：
| 状态码 | 业务码 | 说明 |
|---|---|---|
| 500 | `SYS_INTERNAL_ERROR` | 服务器内部错误 |
| 503 | `SYS_MAINTENANCE` | 系统维护中/数据库未连接 |

### 5.2 接口：用户登录
- 接口名称：User Login
- 方法与路径：`POST /api/auth/login`
- 调用时机：用户点击登录按钮。
- 幂等要求：`否`
- 超时要求：`5s`

#### 请求定义
- Header：`Content-Type: application/json`
- Body（JSON）：
```json
{
  "username": "admin",
  "password": "secret_password"
}
```
- 字段约束：
  - `username`: 必填，长度 1-50，自动 **Trim** (去除首尾空格)。
  - `password`: 必填，长度 6-100，**No Trim** (保留首尾空格，严格匹配用户输入)。

#### 响应定义
- 成功响应（JSON）：
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "d87s9d8...",
    "user": {
      "id": "u_001",
      "username": "admin",
      "displayName": "Administrator",
      "roles": ["admin"]
    }
  }
}
```

#### 安全与限流
- **限流**：单 IP 限制 10 次/分钟。
- **锁定**：单用户连续失败 5 次，锁定 30 分钟。
- **审计**：记录 `client_ip`, `user_agent`, `login_status`, `timestamp`。
- 错误响应：
| HTTP 状态码 | 业务码 | 说明 |
|---|---|---|
| 401 | `AUTH_INVALID_CREDENTIALS` | 用户名或密码错误 |
| 400 | `AUTH_MISSING_FIELD` | 缺失必填项 |
| 403 | `AUTH_LOCKED` | 账号被锁定 |

### 5.3 接口：Token 校验与刷新 (补充)
> 用于页面初始化时的静默登录逻辑。

#### 5.3.1 获取当前用户 (Validate)
- 接口名称：Get Current User
- 方法与路径：`GET /api/auth/me`
- Header：`Authorization: Bearer {accessToken}`
- 成功响应（JSON）：
```json
{
  "status": "success",
  "data": {
    "id": "u_001",
    "username": "admin",
    "displayName": "Administrator",
    "roles": ["admin"]
  }
}
```
- 错误响应：
| 状态码 | 业务码 | 说明 |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token 已过期 (前端应尝试 Refresh) |
| 401 | `AUTH_TOKEN_INVALID` | Token 无效或格式错误 |

#### 5.3.2 刷新 Token
- 接口名称：Refresh Token
- 方法与路径：`POST /api/auth/refresh`
- Body：`{ "refreshToken": "..." }`
- 成功响应（JSON）：
```json
{
  "status": "success",
  "data": {
    "accessToken": "new_access_token...",
    "refreshToken": "new_refresh_token..."
  }
}
```
- 错误响应：
| 状态码 | 业务码 | 说明 |
|---|---|---|
| 400 | `AUTH_REFRESH_TOKEN_INVALID` | Refresh Token 无效/不存在 |
| 403 | `AUTH_REFRESH_TOKEN_EXPIRED` | Refresh Token 已过期 (需重新登录) |
| 403 | `AUTH_REFRESH_TOKEN_REVOKED` | Refresh Token 已被撤销 |

#### 5.3.3 退出登录
- 接口名称：Logout
- 方法与路径：`POST /api/auth/logout`
- Body：`{ "refreshToken": "..." }`
- 成功响应（JSON）：
```json
{
  "status": "success",
  "data": null
}
```
- 错误响应：
| 状态码 | 业务码 | 说明 |
|---|---|---|
| 400 | `AUTH_REFRESH_TOKEN_INVALID` | 格式错误 |
| 200 | `N/A` | 即便 Token 无效也返回成功 (幂等设计) |

### 5.4 接口：I18n 资源拉取
- 接口名称：Get I18n Resources
- 方法与路径：`GET /api/i18n/resources`
- 调用时机：应用启动时，或语言切换时。
- Query 参数：
| 字段 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `lang` | string | 否 | 系统默认 | 语言代码 (zh/ja/en)，若为空则由后端根据 Accept-Language 或配置决定 |

- 缓存策略：后端应支持 `ETag` / `If-None-Match`，内容未变返回 `304`。

#### 响应定义
- 成功响应（JSON）：
```json
{
  "status": "success",
  "data": {
    "app": { "title": "OneCRM" },
    "auth": { "login_btn": "..." }
  },
  "meta": {
    "version": "v1.0.2", // 字典版本号
    "lang": "ja"         // 实际返回的语言
  }
}
```

#### 错误响应
- 超时：3s
- 重试：前端失败可重试 1 次。
| 状态码 | 业务码 | 说明 |
|---|---|---|
| 400 | `I18N_LANG_NOT_SUPPORTED` | 不支持的语言代码 |

## 6. 领域规则与状态流转
- **登录锁定**：连续失败 5 次，锁定账号 30 分钟。
- **Token 有效期**：Access Token 15分钟，Refresh Token 7天。

## 7. 权限与安全
### 7.1 接口鉴权分类
- **Public (开放)**:
  - `GET /api/setup/admin`
  - `GET /api/i18n/resources`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh` (通过 RefreshToken 换取)
- **Protected (需登录)**:
  - `GET /api/auth/me` (Bearer Token)
  - `POST /api/auth/logout` (Bearer Token + RefreshToken)

### 7.2 安全要求
- **敏感字段保护**: `password` 字段在传输层必须 HTTPS，应用层接收后**保留首尾空格** (不执行 Trim)，防止用户输入意图被篡改。
- **日志脱敏**: 禁止在 INFO/DEBUG 日志中打印 `password`、`accessToken`、`refreshToken`。

## 8. 后端实现约束
### 8.1 分层落点
- `Domain`: `User` 实体，`AuthService` (密码校验)。
- `Application`: `LoginUseCase` (处理登录流程，生成 Token)。
- `Infrastructure`: `JwtProvider` (生成 JWT), `UserRepository` (SQL/NoSQL).

### 8.2 公共资源复用
- 错误响应需遵循全局 `ApiResponse` 结构。

## 9. 验收标准
1. Given 系统正常但未初始化 (`exists: false`), When 访问首页, Then 跳转 `/setup`。
2. Given 系统错误或超时 (500/Timeout), When 访问首页, Then 阻断进入并显示 "System Unreachable" 错误页。
3. Given 错误密码, When 登录, Then 返回 401 及错误提示。
4. Given 正确密码, When 登录, Then 返回 Token 并跳转首页。
5. Given 切换语言为 `ja`, When 请求 `GET /api/i18n/resources`, Then 返回日文词条。
