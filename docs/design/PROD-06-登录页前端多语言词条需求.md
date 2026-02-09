# PROD-06-登录页前端多语言词条需求

> 目的：前端通过本模板提交多语言词条需求，后端据此实现与发布。
> 范围：仅词条，不包含前端代码改动。

## 1. 基本信息
- 需求标题：登录页 UI 国际化词条
- 需求编号：REQ-I18N-2026-001
- 提交人（前端）：Agent-Antigravity
- 关联页面（路由）：`/login`
- 优先级：`P0`
- 目标上线日期：2026-02-10

## 2. 场景说明
- 功能场景：用户访问登录页（未登录状态）。
- 触发动作（按钮/弹窗/列表/提示）：页面加载、表单交互、错误提示。
- 是否是已有词条变更：`是` (从硬编码改为动态获取)
- 是否涉及核心词条（`MENU_`/`LBL_`/`BTN_`/`MSG_`/`ERR_` 等）：`是`
- 若是核心词条，请说明影响范围：仅限登录页及全局应用标题。

## 3. 词条清单
| Key | 中文(zh) | 日文(ja) | 英文(en) | 使用位置 | 类型 |
|---|---|---|---|---|---|
| `APP_TITLE` | OneCRM | OneCRM | OneCRM | 浏览器标题/Logo | `LBL` |
| `APP_COPYRIGHT` | © 2026 OneCRM Inc. 保留所有权利。 | © 2026 OneCRM Inc. All Rights Reserved. | © 2026 OneCRM Inc. All Rights Reserved. | 底部版权 | `TXT` |
| `AUTH_EYEBROW` | 安全访问 | セキュアアクセス | SECURE ACCESS | 可以在 Hero 区域显示的小标题 | `LBL` |
| `AUTH_SLOGAN_MAIN` | 连接团队，\n加速成长 | チームをつなぎ、\n成長を加速する | Connect Teams,\nAccelerate Growth | Hero 大标题 | `TXT` |
| `AUTH_SLOGAN_SUB` | 现代商业管理与协作平台 | 最新のビジネス管理とコラボレーションのためのプラットフォーム | Platform for modern business management | Hero 副标题 | `TXT` |
| `AUTH_PANEL_BRAND` | 登录工作区 | ワークスペースへログイン | Login to Workspace | 面板左上角品牌区 | `LBL` |
| `AUTH_PANEL_WELCOME` | 欢迎回来 | おかえりなさい | WELCOME BACK | 面板 Eyebrow | `LBL` |
| `AUTH_PANEL_TITLE` | 登录 | ログイン | Login | 表单标题 | `LBL` |
| `AUTH_PANEL_USERNAME_LABEL` | 用户名或邮箱 | ユーザー名またはメール | Username or Email | 用户名输入框 Label | `LBL` |
| `AUTH_PANEL_USERNAME_HINT` | 请输入有效账号 | 有効なアカウントを入力してください | Please enter a valid account | 用户名输入框 Hint/Placeholder | `TXT` |
| `AUTH_PANEL_PASSWORD_LABEL` | 密码 | パスワード | Password | 密码输入框 Label | `LBL` |
| `AUTH_PANEL_LOGIN_BTN` | 登录 | ログイン | Login | 登录按钮 | `BTN` |
| `AUTH_PANEL_DIVIDER` | 或者 | または | OR | SSO 分隔符 | `TXT` |
| `AUTH_PANEL_FOOTER_PROMO` | 让关系更智能，协作更自然。 | 関係をもっとスマートに、協働をもっと自然に。 | Relation smarter, collaboration natural. | 底部宣传语 | `TXT` |
| `AUTH_PANEL_NO_ACCOUNT` | 还没有账号？ | アカウントがありませんか？ | No account? | 注册引导前缀 | `TXT` |
| `AUTH_PANEL_REGISTER` | 立即注册 | 登録 | Register | 注册链接文本 | `BTN` |
| `LANG_ZH` | 中文 | 中文 | CN | 语言切换器 | `LBL` |
| `LANG_JA` | 日语 | 日本語 | JA | 语言切换器 | `LBL` |
| `LANG_EN` | 英语 | EN | EN | 语言切换器 | `LBL` |
| `ERR_USERNAME_REQUIRED` | 用户名不能为空 | ユーザー名は必須です | Username is required | 表单校验 | `ERR` |
| `ERR_PASSWORD_REQUIRED` | 密码不能为空 | パスワードは必須です | Password is required | 表单校验 | `ERR` |
| `ERR_LOGIN_FAILED` | 登录失败，请检查账号密码 | ログインに失敗しました | Login failed, check credentials | 接口错误通用提示 | `ERR` |
| `ERR_PARSE_RESPONSE` | 服务器响应解析失败 | サーバー応答の解析に失敗しました | Failed to parse server response | 接口错误通用提示 | `ERR` |

## 4. 文案规则
- 是否允许插值参数：`否`
- 若允许，请列参数：无
- 多行文案是否需要换行：`是` (如 `AUTH_SLOGAN_MAIN`)
- 是否需要保留术语英文原文：`是` (如 `OneCRM`)

## 5. 行为与缓存要求
- 是否要求立即生效：`是`
- 前端刷新策略：`依赖版本号` via `/api/i18n/version`
- 是否需要后端执行缓存重载：`是`

## 6. 权限与审核
- 需求确认人（产品/前端负责人）：Agent-Antigravity
- 核心词条变更审批人（如适用）：Product Owner
- 是否允许覆盖受保护 Key：`是` (申请特批：UI 重构需要统一术语)
- 覆盖原因（如适用）：本次为 v0.2.0 UI Overhaul，需全量更新登录页相关文案以匹配新设计风格。

## 7. 提交格式（Batch Upsert）
> 对应接口：`POST /api/i18n/resources`
> 鉴权要求：`Authorization: Bearer {adminToken}` (仅限管理员)

**请求定义**：
```json
{
  "lang": "zh",
  "module": "auth", // 可选
  "force": true,    // true=覆盖受保护Key, false=遇到受保护Key则报错
  "items": {
    "AUTH_SLOGAN_MAIN": "连接团队，\n加速成长",
    "AUTH_PANEL_LOGIN_BTN": "登录"
  }
}
```

**响应定义**：
- 成功 (200 OK):
```json
{
  "status": "success",
  "data": {
    "processed": 2,
    "success": 2,
    "version": "v1.0.3"
  }
}
```
- 失败 (409 Conflict):
  - 场景：`force: false` 且存在受保护 Key。
```json
{
  "status": "error",
  "error_code": "I18N_KEY_PROTECTED",
  "message": "Key [APP_TITLE] is protected. Use force=true to override."
}
```

## 8. 验收标准
1. 前端按指定语言拉取字典后可读到全部新词条。
2. 未指定语言时按系统默认语言返回。
3. 词条更新后，`/api/i18n/version` 版本号变化，ETag 刷新。
4. 若请求 `If-None-Match` 命中，返回 `304`。
