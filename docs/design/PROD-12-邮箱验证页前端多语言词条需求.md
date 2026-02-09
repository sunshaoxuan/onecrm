# PROD-12-邮箱验证页前端多语言词条需求（OneCRM）

## 1. 基本信息
- 需求标题：邮箱验证页词条定义
- 需求编号：PROD-12
- 提交人（前端）：Agent-Antigravity
- 关联页面：`/verify.html`
- 关联接口：PROD-11

## 2. 场景说明
- 功能场景：用户点击验证链接后的验证结果展示，以及重新发送验证邮件。
- 是否是已有词条变更：`否`
- 是否涉及核心词条：`是`

## 3. 权限与审核
- **受保护 Key 策略**：本次新增词条均为页面级词条，**不覆盖**已有核心词条。
- **审批人**：由后端 I18n 管理员审核后批量导入。
- **变更范围**：仅限 `LBL_VERIFY_*`、`BTN_VERIFY_*`、`TXT_VERIFY_*`、`MSG_VERIFY_*`、`ERR_VERIFY_*` 前缀词条。

---

## 4. 词条清单

### 4.1 页面标签类 (LBL_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `LBL_VERIFY_PAGE_TITLE` | 邮箱验证 | メール認証 | Email Verification | 页面标题 |
| `LBL_VERIFY_EMAIL` | 邮箱地址 | メールアドレス | Email Address | 重发表单 |

### 4.2 按钮类 (BTN_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `BTN_VERIFY_RESEND` | 重新发送验证邮件 | 確認メールを再送 | Resend Verification Email | 重发按钮 |
| `BTN_VERIFY_LOGIN` | 前往登录 | ログインへ | Go to Login | 验证成功后 |
| `BTN_VERIFY_REGISTER` | 重新注册 | 再登録 | Register Again | 验证失败后 |

### 4.3 文案类 (TXT_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `TXT_VERIFY_EYEBROW` | 账户安全 | アカウントセキュリティ | Account Security | Eyebrow 小字 |
| `TXT_VERIFY_CHECKING` | 正在验证您的邮箱... | メールアドレスを確認しています... | Verifying your email... | 验证中状态 |
| `TXT_VERIFY_SUCCESS_TITLE` | 验证成功 | 認証が完了しました | Verification Successful | 成功标题 |
| `TXT_VERIFY_SUCCESS_DESC` | 您的邮箱已成功验证，现在可以登录了。 | メールアドレスの確認が完了しました。ログインできます。 | Your email has been verified. You can now log in. | 成功描述 |
| `TXT_VERIFY_EXPIRED_TITLE` | 链接已过期 | リンクの有効期限が切れました | Link Expired | 过期标题 |
| `TXT_VERIFY_EXPIRED_DESC` | 验证链接已过期，请重新发送验证邮件。 | 認証リンクの有効期限が切れました。確認メールを再送してください。 | The verification link has expired. Please resend the verification email. | 过期描述 |
| `TXT_VERIFY_INVALID_TITLE` | 链接无效 | リンクが無効です | Invalid Link | 无效标题 |
| `TXT_VERIFY_INVALID_DESC` | 验证链接无效或已被使用，请重新注册或联系客服。 | 認証リンクが無効または使用済みです。再登録いただくか、サポートにお問い合わせください。 | The verification link is invalid or has already been used. Please register again or contact support. | 无效描述 |
| `TXT_VERIFY_ALREADY_TITLE` | 邮箱已验证 | 認証済みです | Already Verified | 已验证标题 |
| `TXT_VERIFY_ALREADY_DESC` | 您的邮箱已经验证过了，可以直接登录。 | メールアドレスは既に認証済みです。ログインしてください。 | Your email is already verified. Please log in. | 已验证描述 |
| `TXT_VERIFY_RESEND_TITLE` | 重新发送验证邮件 | 確認メールを再送 | Resend Verification Email | 重发表单标题 |
| `TXT_VERIFY_RESEND_DESC` | 请输入您的注册邮箱，我们将重新发送验证链接。 | 登録したメールアドレスを入力してください。確認リンクを再送します。 | Enter your registered email and we'll resend the verification link. | 重发表单描述 |

### 4.4 消息类 (MSG_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `MSG_VERIFY_RESEND_SUCCESS` | 验证邮件已发送，请查收。 | 確認メールを送信しました。ご確認ください。 | Verification email sent. Please check your inbox. | 重发成功 |
| `MSG_VERIFY_RESEND_HINT` | 没有收到邮件？请检查垃圾邮件文件夹。 | メールが届きませんか？迷惑メールフォルダをご確認ください。 | Didn't receive the email? Check your spam folder. | 提示信息 |

### 4.5 错误类 (ERR_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `ERR_VERIFY_TOKEN_MISSING` | 验证链接无效 | 認証リンクが無効です | Invalid verification link | token 缺失 |
| `ERR_VERIFY_TOKEN_INVALID` | 验证链接无效或已被篡改 | 認証リンクが無効または改ざんされています | Verification link is invalid or has been tampered with | token 无效 |
| `ERR_VERIFY_TOKEN_EXPIRED` | 验证链接已过期 | 認証リンクの有効期限が切れました | Verification link has expired | token 过期 |
| `ERR_VERIFY_ALREADY_VERIFIED` | 邮箱已验证 | メールアドレスは既に認証されています | Email is already verified | 重复验证 |
| `ERR_VERIFY_EMAIL_REQUIRED` | 请输入邮箱地址 | メールアドレスを入力してください | Please enter your email | 邮箱为空 |
| `ERR_VERIFY_EMAIL_INVALID` | 邮箱格式不正确 | メールアドレスの形式が正しくありません | Invalid email format | 邮箱格式错误 |
| `ERR_VERIFY_RATE_LIMITED` | 发送过于频繁，请 {{seconds}} 秒后再试 | 送信頻度が高すぎます。{{seconds}} 秒後に再試行してください | Too many requests, please retry in {{seconds}} seconds | 限流 |
| `ERR_VERIFY_SYSTEM_ERROR` | 系统繁忙，请稍后再试 | システムエラーが発生しました | System error, please try again later | 系统错误 |

---

## 5. 文案规则

### 5.1 占位符规范
- **语法**：使用双花括号 `{{variableName}}`
- **替换责任**：**前端替换**
- **占位符列表**：
  | 占位符 | 说明 | 示例值 |
  |--------|------|--------|
  | `{{seconds}}` | 限流等待秒数 | 60 |
  | `{{email}}` | 用户邮箱（脱敏显示） | u***@example.com |

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
  "module": "verify",
  "force": false,
  "items": {
    "LBL_VERIFY_PAGE_TITLE": "メール認証",
    "LBL_VERIFY_EMAIL": "メールアドレス",
    "BTN_VERIFY_RESEND": "確認メールを再送",
    "BTN_VERIFY_LOGIN": "ログインへ",
    "BTN_VERIFY_REGISTER": "再登録",
    "TXT_VERIFY_EYEBROW": "アカウントセキュリティ",
    "TXT_VERIFY_CHECKING": "メールアドレスを確認しています...",
    "TXT_VERIFY_SUCCESS_TITLE": "認証が完了しました",
    "TXT_VERIFY_SUCCESS_DESC": "メールアドレスの確認が完了しました。ログインできます。",
    "TXT_VERIFY_EXPIRED_TITLE": "リンクの有効期限が切れました",
    "TXT_VERIFY_EXPIRED_DESC": "認証リンクの有効期限が切れました。確認メールを再送してください。",
    "ERR_VERIFY_TOKEN_EXPIRED": "認証リンクの有効期限が切れました",
    "ERR_VERIFY_RATE_LIMITED": "送信頻度が高すぎます。{{seconds}} 秒後に再試行してください",
    "MSG_VERIFY_RESEND_SUCCESS": "確認メールを送信しました。ご確認ください。"
  }
}
```

**响应定义**：
- 成功 (200 OK):
```json
{
  "status": "success",
  "data": {
    "processed": 14,
    "success": 14,
    "version": "v1.0.7"
  }
}
```

---

## 8. 验收标准
1. 前端按指定语言调用 `GET /api/i18n/resources?lang=ja` 可读到全部 verify 模块词条。
2. 词条翻译应与登录页 (`PROD-06`) 和注册页 (`PROD-10`) 保持风格一致。
3. 占位符词条支持 `{{variableName}}` 格式，前端负责替换。
4. 验证成功、过期、无效、已验证等状态均有对应词条覆盖。
