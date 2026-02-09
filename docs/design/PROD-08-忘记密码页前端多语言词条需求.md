# PROD-08-忘记密码页前端多语言词条需求（OneCRM）

## 1. 基本信息
- 需求标题：忘记密码页词条定义
- 需求编号：PROD-08
- 提交人（前端）：Agent-Antigravity
- 关联页面：`/forgetpass.html`
- 关联接口：PROD-07

## 2. 场景说明
- 功能场景：用户忘记密码时，通过邮箱找回。
- 是否是已有词条变更：`否`（本次不变更 `APP_TITLE` 等通用词条）
- 是否涉及核心词条：`是`

## 3. 权限与审核
- **受保护 Key 策略**：本次新增词条均为页面级词条，**不覆盖**已有核心词条。
- **审批人**：由后端 I18n 管理员审核后批量导入。
- **变更范围**：仅限 `LBL_FORGET_*`、`BTN_FORGET_*`、`MSG_FORGET_*`、`ERR_FORGET_*` 前缀词条。

## 4. 词条清单

### 4.1 页面标签类 (LBL_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `LBL_FORGET_PAGE_TITLE` | 找回密码 | パスワードの再設定 | Reset Password | 页面/Brand 标题 |
| `LBL_FORGET_EMAIL` | 邮箱地址 | メールアドレス | Email Address | 输入框 Label |

### 4.2 按钮类 (BTN_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `BTN_FORGET_SUBMIT` | 发送重置链接 | 再設定リンクを送信 | Send Reset Link | 提交按钮 |
| `BTN_FORGET_BACK_LOGIN` | 返回登录 | ログインに戻る | Back to Login | 返回链接 |

### 4.3 文案类 (TXT_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `TXT_FORGET_EYEBROW` | 账号恢复 | アカウントの復旧 | Account Recovery | 表单上方小字 |
| `TXT_FORGET_FORM_TITLE` | 忘记密码？ | パスワードをお忘れですか？ | Forgot Password? | 表单主标题 |
| `TXT_FORGET_FORM_SUBTITLE` | 请输入注册邮箱，我们将发送重置链接。 | 登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。 | Please enter your email to receive a reset link. | 表单副标题 |

### 4.4 消息类 (MSG_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `MSG_FORGET_LINK_SENT` | 链接已发送，请检查您的邮箱。 | 再設定リンクを送信しました。メールを確認してください。 | Reset link sent, please check your inbox. | 成功提示 |

### 4.5 错误类 (ERR_)
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 |
|---|---|---|---|---|
| `ERR_FORGET_EMAIL_REQUIRED` | 请输入有效的邮箱地址 | 有効なメールアドレスを入力してください | Please enter a valid email address | 邮箱空值错误 |
| `ERR_FORGET_EMAIL_INVALID` | 邮箱格式不正确 | メールアドレスの形式が正しくありません | Invalid email format | 邮箱格式错误 |
| `ERR_FORGET_RATE_LIMITED` | 发送过于频繁，请 {{seconds}} 秒后再试 | 送信頻度が高すぎます。{{seconds}} 秒後に再試行してください | Too many requests, please retry in {{seconds}} seconds | 限流提示（带占位符） |
| `ERR_FORGET_SYSTEM_ERROR` | 系统繁忙，请稍后再试 | システムが混雑しています。しばらくしてから再試行してください | System busy, please try again later | 系统错误 |

## 5. 文案规则
### 5.1 占位符规范
- **语法**：使用双花括号 `{{variableName}}`，与项目模板保持一致。
- **替换责任**：**前端替换**。后端返回原始占位符文本，前端根据 API 响应中的 `retryAfterSeconds` 字段进行实时替换。
- **示例**：
  ```typescript
  // 前端替换逻辑
  const message = ERR_FORGET_RATE_LIMITED.replace('{{seconds}}', retryAfterSeconds.toString());
  ```

## 6. 缓存与版本策略
- **生效时机**：词条导入后立即生效，无需等待缓存刷新。
- **版本协商**：依赖 `/api/i18n/resources` 的 ETag/304 机制。
- **版本查询**：可通过 `GET /api/i18n/version` 查询当前词典版本号。

## 7. 导入格式（与 PROD-06 保持一致）
> 对应接口：`POST /api/i18n/resources`
> 鉴权要求：`Authorization: Bearer {adminToken}` (仅限管理员)

**请求定义**：
```json
{
  "lang": "zh",
  "module": "forget",
  "force": false,
  "items": {
    "LBL_FORGET_PAGE_TITLE": "找回密码",
    "LBL_FORGET_EMAIL": "邮箱地址",
    "BTN_FORGET_SUBMIT": "发送重置链接",
    "BTN_FORGET_BACK_LOGIN": "返回登录",
    "TXT_FORGET_EYEBROW": "账号恢复",
    "TXT_FORGET_FORM_TITLE": "忘记密码？",
    "TXT_FORGET_FORM_SUBTITLE": "请输入注册邮箱，我们将发送重置链接。",
    "MSG_FORGET_LINK_SENT": "链接已发送，请检查您的邮箱。",
    "ERR_FORGET_EMAIL_REQUIRED": "请输入有效的邮箱地址",
    "ERR_FORGET_EMAIL_INVALID": "邮箱格式不正确",
    "ERR_FORGET_RATE_LIMITED": "发送过于频繁，请 {{seconds}} 秒后再试",
    "ERR_FORGET_SYSTEM_ERROR": "系统繁忙，请稍后再试"
  }
}
```

**响应定义**：
- 成功 (200 OK):
```json
{
  "status": "success",
  "data": {
    "processed": 12,
    "success": 12,
    "version": "v1.0.4"
  }
}
```
- 失败 (409 Conflict):
  - 场景：`force: false` 且存在受保护 Key。
```json
{
  "status": "error",
  "error_code": "I18N_KEY_PROTECTED",
  "message": "Key [LBL_FORGET_PAGE_TITLE] is protected. Use force=true to override."
}
```
- 失败 (400 Bad Request):
  - 场景：请求格式错误或缺少必填字段。
```json
{
  "status": "error",
  "error_code": "ERR_INVALID_ARGUMENT",
  "message": "Field 'lang' is required."
}
```

## 8. 验收标准
1. 前端按指定语言调用 `GET /api/i18n/resources?lang=ja` 可读到全部新词条。
2. 词条翻译应与登录页 (`PROD-06`) 保持风格一致。
3. 错误词条 `ERR_FORGET_RATE_LIMITED` 支持 `{{seconds}}` 占位符，前端负责替换。
