# PROD-10-用户注册页前端多语言词条需求（OneCRM）

## 1. 基本信息
- 需求标题：用户注册页词条定义
- 需求编号：PROD-10
- 提交人（前端）：Agent-Antigravity
- 关联页面：`/register.html`
- 关联接口：PROD-09

## 2. 场景说明
- 功能场景：用户自由注册或通过 SSO 注册新账户。
- 是否是已有词条变更：`否`
- 是否涉及核心词条：`是`

## 3. 权限与审核
- **受保护 Key 策略**：本次新增词条均为页面级词条，**不覆盖**已有核心词条。
- **审批人**：由后端 I18n 管理员审核后批量导入。
- **变更范围**：仅限 `LBL_REGISTER_*`、`BTN_REGISTER_*`、`TXT_REGISTER_*`、`MSG_REGISTER_*`、`ERR_REGISTER_*` 前缀词条。

---

## 4. 词条清单

### 4.1 页面标签类 (LBL_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `LBL_REGISTER_PAGE_TITLE` | 创建新账户 | 新規アカウント作成 | Create Account | 页面标题 |
| `LBL_REGISTER_NAME` | 姓名 | 氏名 | Full Name | 姓名输入框 |
| `LBL_REGISTER_EMAIL` | 邮箱地址 | メールアドレス | Email Address | 邮箱输入框 |
| `LBL_REGISTER_PASSWORD` | 密码 | パスワード | Password | 密码输入框 |
| `LBL_REGISTER_CONFIRM` | 确认密码 | パスワード（確認） | Confirm Password | 确认密码输入框 |

### 4.2 按钮类 (BTN_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `BTN_REGISTER_SUBMIT` | 创建账户 | アカウントを作成 | Create Account | 提交按钮 |
| `BTN_REGISTER_SSO_MS` | 使用 Microsoft 继续 | Microsoft 365 で続ける | Continue with Microsoft | Microsoft SSO 按钮 |
| `BTN_REGISTER_SSO_GOOGLE` | 使用 Google 继续 | Google Workspace で続ける | Continue with Google | Google SSO 按钮 |
| `BTN_REGISTER_BACK_LOGIN` | 返回登录 | ログイン | Back to Login | 返回链接 |

### 4.3 文案类 (TXT_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `TXT_REGISTER_EYEBROW` | 账户注册 | アカウント登録 | Account Registration | Eyebrow 小字 |
| `TXT_REGISTER_FORM_TITLE` | 创建账户 | アカウントを作成 | Create Account | 表单标题 |
| `TXT_REGISTER_SSO_TITLE` | 使用企业账户注册 | 企業アカウントで登録 | Register with Corporate Account | SSO 表单标题 |
| `TXT_REGISTER_SSO_DESC` | 使用您的企业账户一键注册。无需设置密码。 | お使いの企業アカウントでワンクリック登録できます。パスワードの設定は不要です。 | One-click registration with your corporate account. No password required. | SSO 说明 |
| `TXT_REGISTER_OR` | 或者 | または | OR | 分隔符 |
| `TXT_REGISTER_TERMS_PREFIX` | 我同意 | 私は | I agree to the | 条款前缀 |
| `TXT_REGISTER_TERMS_LINK_TEXT` | 服务条款 | 利用規約 | Terms of Service | 条款链接文本 |
| `TXT_REGISTER_AND` | 和 | および | and | 连接词 |
| `TXT_REGISTER_PRIVACY_LINK_TEXT` | 隐私政策 | プライバシーポリシー | Privacy Policy | 隐私链接文本 |
| `TXT_REGISTER_HAS_ACCOUNT` | 已有账户？ | すでにアカウントをお持ちですか？ | Already have an account? | 登录引导 |
| `TXT_REGISTER_SSO_INFO` | SSO 注册后，您的企业邮箱将自动绑定到 OneCRM 账户。首次登录时可能需要确认资料。 | SSO 登録では、お使いの企業メールアドレスが自動的に OneCRM アカウントに紐づけられます。初回ログイン時にプロフィール情報の確認をお願いする場合があります。 | With SSO registration, your corporate email will be automatically linked to your OneCRM account. You may be asked to confirm your profile on first login. | SSO 说明框 |
| `TXT_REGISTER_PASSWORD_HINT` | 至少 8 个字符 | 8文字以上 | At least 8 characters | 密码提示 |

> **条款链接渲染规范**：词条仅提供纯文本，前端固定组件渲染链接结构。示例：
> ```tsx
> <span>{t('TXT_REGISTER_TERMS_PREFIX')}</span>
> <a href="/terms">{t('TXT_REGISTER_TERMS_LINK_TEXT')}</a>
> <span>{t('TXT_REGISTER_AND')}</span>
> <a href="/privacy">{t('TXT_REGISTER_PRIVACY_LINK_TEXT')}</a>
> ```
> 链接 URL 由前端配置常量控制，不进入词条系统，避免 XSS 风险。

### 4.4 消息类 (MSG_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `MSG_REGISTER_SUCCESS` | 账户创建成功！请查收验证邮件。 | アカウントが作成されました！確認メールをご確認ください。 | Account created! Please check your email for verification. | 注册成功 |
| `MSG_REGISTER_SSO_REDIRECT` | 正在跳转到认证页面... | 認証ページへリダイレクトしています... | Redirecting to authentication... | SSO 跳转 |

### 4.5 错误类 (ERR_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `ERR_REGISTER_NAME_REQUIRED` | 请输入姓名 | 氏名を入力してください | Please enter your name | 姓名为空 |
| `ERR_REGISTER_EMAIL_REQUIRED` | 请输入邮箱地址 | メールアドレスを入力してください | Please enter your email | 邮箱为空 |
| `ERR_REGISTER_EMAIL_INVALID` | 邮箱格式不正确 | メールアドレスの形式が正しくありません | Invalid email format | 邮箱格式错误 |
| `ERR_REGISTER_EMAIL_EXISTS` | 此邮箱已注册 | このメールアドレスは既に登録されています | This email is already registered | 邮箱冲突 |
| `ERR_REGISTER_PASSWORD_REQUIRED` | 请输入密码 | パスワードを入力してください | Please enter a password | 密码为空 |
| `ERR_REGISTER_PASSWORD_WEAK` | 密码至少需要 8 个字符 | パスワードは8文字以上必要です | Password must be at least 8 characters | 密码过短 |
| `ERR_REGISTER_PASSWORD_MISMATCH` | 两次输入的密码不一致 | パスワードが一致しません | Passwords do not match | 密码不匹配 |
| `ERR_REGISTER_TERMS_REQUIRED` | 请同意服务条款 | 利用規約への同意が必要です | Please accept the terms of service | 未勾选条款 |
| `ERR_REGISTER_SSO_FAILED` | SSO 认证失败，请重试 | SSO 認証に失敗しました。再試行してください | SSO authentication failed, please try again | SSO 失败 |
| `ERR_REGISTER_SSO_DOMAIN` | 您的企业域名未授权使用此服务 | お使いの企業ドメインはこのサービスを使用する権限がありません | Your corporate domain is not authorized for this service | SSO 域名未授权 |
| `ERR_REGISTER_SSO_MISSING_PROVIDER` | 请选择登录方式 | ログイン方法を選択してください | Please select a login method | provider 参数缺失 |
| `ERR_REGISTER_SSO_UNSUPPORTED` | 不支持的登录方式 | サポートされていないログイン方法です | Unsupported login method | provider 不支持 |
| `ERR_REGISTER_SSO_INVALID_STATE` | 会话无效，请重新登录 | セッションが無効です。もう一度お試しください | Session is invalid, please try again | SSO State 不匹配 |
| `ERR_REGISTER_SSO_CODE_EXPIRED` | 授权码已过期，请重新登录 | 認証コードが期限切れです。もう一度お試しください | Authorization code expired, please try again | SSO Code 过期 |
| `ERR_REGISTER_SSO_PROVIDER_ERROR` | 外部认证服务出错 | 外部認証に失敗しました | External authentication failed | IdP 返回错误 |
| `ERR_REGISTER_RATE_LIMITED` | 注册请求过于频繁，请 {{seconds}} 秒后再试 | 登録リクエストが多すぎます。{{seconds}} 秒後に再試行してください | Too many registration requests, please retry in {{seconds}} seconds | 注册限流 |
| `ERR_REGISTER_SSO_RATE_LIMITED` | SSO 请求过于频繁，请 {{seconds}} 秒后再试 | SSO リクエストが多すぎます。{{seconds}} 秒後に再試行してください | Too many SSO requests, please retry in {{seconds}} seconds | SSO 限流 |
| `ERR_REGISTER_SYSTEM_ERROR` | 系统繁忙，请稍后再试 | システムエラーが発生しました | System error, please try again later | 系统错误 |

---

## 5. 文案规则

### 5.1 占位符规范
- **语法**：使用双花括号 `{{variableName}}`
- **替换责任**：**前端替换**
- **占位符列表**：
  | 占位符 | 说明 | 示例值 |
  |--------|------|--------|
  | `{{seconds}}` | 限流等待秒数 | 60 |

> **安全规范**：词条中禁止包含 HTML 片段或链接 URL，避免 XSS 风险。所有链接由前端固定组件渲染。

---

## 6. 缓存与版本策略
- **生效时机**：词条导入后立即生效
- **版本协商**：依赖 `/api/i18n/resources` 的 ETag/304 机制
- **版本查询**：可通过 `GET /api/i18n/version` 查询当前词典版本号

---

## 7. 导入格式（与 PROD-06 保持一致）
> 对应接口：`POST /api/i18n/resources`
> 鉴权要求：`Authorization: Bearer {adminToken}` (仅限管理员)

**请求定义**：
```json
{
  "lang": "ja",
  "module": "register",
  "force": false,
  "items": {
    "LBL_REGISTER_PAGE_TITLE": "新規アカウント作成",
    "LBL_REGISTER_NAME": "氏名",
    "LBL_REGISTER_EMAIL": "メールアドレス",
    "LBL_REGISTER_PASSWORD": "パスワード",
    "LBL_REGISTER_CONFIRM": "パスワード（確認）",
    "BTN_REGISTER_SUBMIT": "アカウントを作成",
    "BTN_REGISTER_SSO_MS": "Microsoft 365 で続ける",
    "BTN_REGISTER_SSO_GOOGLE": "Google Workspace で続ける",
    "ERR_REGISTER_PASSWORD_MISMATCH": "パスワードが一致しません",
    "ERR_REGISTER_EMAIL_EXISTS": "このメールアドレスは既に登録されています",
    "ERR_REGISTER_SSO_MISSING_PROVIDER": "ログイン方法を選択してください",
    "ERR_REGISTER_SSO_UNSUPPORTED": "サポートされていないログイン方法です",
    "ERR_REGISTER_SSO_INVALID_STATE": "セッションが無効です。もう一度お試しください",
    "ERR_REGISTER_SSO_CODE_EXPIRED": "認証コードが期限切れです。もう一度お試しください",
    "ERR_REGISTER_SSO_PROVIDER_ERROR": "外部認証に失敗しました",
    "ERR_REGISTER_SSO_RATE_LIMITED": "SSO リクエストが多すぎます。{{seconds}} 秒後に再試行してください"
  }
}
```

**响应定义**：
- 成功 (200 OK):
```json
{
  "status": "success",
  "data": {
    "processed": 13,
    "success": 13,
    "version": "v1.0.6"
  }
}
```
- 失败 (409 Conflict):
  - 场景：`force: false` 且存在受保护 Key。
```json
{
  "status": "error",
  "error_code": "I18N_KEY_PROTECTED",
  "message": "Key [LBL_REGISTER_PAGE_TITLE] is protected. Use force=true to override."
}
```
- 失败 (400 Bad Request):
```json
{
  "status": "error",
  "error_code": "ERR_INVALID_ARGUMENT",
  "message": "Field 'lang' is required."
}
```

---

## 8. 验收标准
1. 前端按指定语言调用 `GET /api/i18n/resources?lang=ja` 可读到全部新词条。
2. 词条翻译应与登录页 (`PROD-06`) 和忘记密码页 (`PROD-08`) 保持风格一致。
3. 占位符词条支持 `{{variableName}}` 格式，前端负责替换。
4. 自由注册和 SSO 注册页面词条完全覆盖。
5. SSO 错误码（`AUTH_SSO_INVALID_STATE`、`AUTH_SSO_CODE_EXPIRED`、`AUTH_SSO_PROVIDER_ERROR`）有对应词条映射。
6. 条款/隐私链接由纯文本词条 + 前端固定组件渲染，无 HTML 片段。
