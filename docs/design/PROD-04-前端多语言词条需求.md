# PROD-04: 前端多语言词条需求

**生效日期**: 2026-02-09
**状态**: 提交中

---

## 1. 概述

为了解决现有前端页面语言混杂（日英中）的问题，并支持未来的国际化（i18n），前端已将所有 UI 文本提取为“词条（Keys）”。
本需求文档定义了这些词条的键名、默认（日文）文案，以及对后端接口的诉求。

## 2. 接口需求

后端需提供一个聚合接口，供前端在应用初始化时获取当前语言的词条资源。

### 2.1 获取多语言资源

- **方法**: `GET`
- **路径**: `/api/i18n/resources`
- **参数**:
    - `lang`: `string` (可选) - 语言代码，如 `ja`, `en`, `zh`。默认为 `ja`。
- **响应**: `JSON` 对象，层级结构如下文定义。

## 3. 词条清单 (Resource Bundle)

以下是前端目前使用的词条结构及默认日语翻译。

### 3.1 App (全局)

| Key | 默认文案 (ja) | 说明 |
| :--- | :--- | :--- |
| `app.title` | OneCRM | 品牌名，通常不翻译 |
| `app.copyright` | © 2026 OneCRM Inc. All Rights Reserved. | 版权声明 |

### 3.2 Auth (认证/登录页)

| Key | 默认文案 (ja) | 说明 |
| :--- | :--- | :--- |
| `auth.eyebrow` | セキュアアクセス | 顶部小标题 (原 SECURE ACCESS) |
| `auth.slogan.main` | チームをつなぎ、\n成長を加速する | 主标语，支持 `\n` 换行 |
| `auth.slogan.sub` | 最新のビジネス管理とコラボレーションのためのプラットフォーム | 副标语 |
| `auth.panel.brand` | ワークスペースへログイン | 登录框顶部品牌文案 |
| `auth.panel.welcome` | おかえりなさい | 欢迎语 (Welcome Back) |
| `auth.panel.title` | ログイン | 表单标题 |
| `auth.panel.username_label` | ユーザー名またはメール | 用户名输入框标签 |
| `auth.panel.username_hint` | 有効なアカウントを入力してください | 输入提示 (原中文已修正) |
| `auth.panel.password_label` | パスワード | 密码输入框标签 |
| `auth.panel.login_button` | ログイン | 登录按钮 |
| `auth.panel.footer_promo` | 関係をもっとスマートに、協働をもっと自然に。 | 底部宣传语 |
| `auth.panel.no_account` | アカウントがありませんか？ | 无账号询问 |
| `auth.panel.register` | 登録 | 注册链接文本 |

### 3.3 Languages (语言名称)

| Key | 默认文案 | 说明 |
| :--- | :--- | :--- |
| `auth.languages.zh` | 中文 | 原生语言名 |
| `auth.languages.ja` | 日本語 | 原生语言名 |
| `auth.languages.en` | EN | 英文缩写 |

## 4. 后续规划

- **动态加载**: 前端将在入口处调用此 API，替换本地的 `Mock Object`。
- **管理后台**: 需要提供一个简单的界面供管理员/运营修改这些文案。
