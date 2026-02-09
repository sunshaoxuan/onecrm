# OneCRM

OneCRM 是一款兼具时尚画面与高效导向的客户信息管理软件。

## 项目核心愿景
打造一个**现代化、非紧凑型**的工作引导平台，通过清晰的视觉引导（大字编码名称）和灵活的页面结构，提升业务处理效率。

## 核心功能模块
- **客户档案门户**：超大字号编码/名称引导，多页签信息展示。
- **动态组织架构**：支持自由组织树型关系，支持公共与私有视图发布。
- **技术参数中心**：结构化的远程连接参数，支持一键连接工具调用。
- **全生命周期追踪**：涵盖实施产品、合约文档、客户化定制、备份链接及需求管理。
- **业务矩阵**：营业、实施、运维等多角色责任绑定。

## 文档指引
项目详细规格与设计已拆分至以下专项文档：
- [PROD-01 核心功能分析](docs/design/PROD-01-核心功能分析.md): 业务功能与数据点详述。
- [UX-01 交互与视觉设计规范](docs/design/UX-01-交互与视觉设计规范.md): 现代化视觉与高感官 UI 准则。
- [ARCH-01 系统架构设计](docs/design/ARCH-01-系统架构设计.md): 逻辑模型、结构化参数源及视图发布逻辑。

统一文档目录：
- `docs/design/`: 设计与产品需求
- `docs/process/`: 规范与流程
- `docs/reference/`: 参考资料
- `docs/history/`: 历史报告
- `docs/templates/`: 前后端协作模板
- `docs/test-cases/`: 测试矩阵与用例

当前模板入口：
- [TPL-API-01 前端驱动接口需求模板](docs/templates/TPL-API-01-前端驱动接口需求模板.md)
- [TPL-I18N-01 前端词条需求模板](docs/templates/TPL-I18N-01-前端词条需求模板.md)

## 后端说明
项目包含独立后端目录 `backend/`，用于 I18n 与对象存储能力落地：
- 词条 API: `/api/i18n/*`
- 存储驱动：`file` / `s3`（兼容 MinIO）
- 合规门禁：`npm run verify`
- 后端规范：`docs/process/STD-09-后端代码合规执行标准.md`

## 最新更新 (v0.2.0 - UI Overhaul)
- **全新登录界面**: 移植自 BobCRM (Calm CRM)，采用现代玻璃拟态设计。
- **国际化 (i18n)**: 支持 中/日/英 多语言切换 (Mock 阶段)。
- **SSO 集成**: 支持 Google 和 Microsoft 单点登录。
- **视觉优化**: 优化了排版、间距和字体，提供更舒适的阅读体验。

## 开发环境
- **前端**: **React (Vite)** + **Tailwind CSS** + **Ant Design** (提供最丰富的业务组件集)
- **样式**: `bob-theme.css` (Calm Design System)
- **后端**: Node.js（独立 `backend/` 服务，I18n + MinIO/S3）
- **数据库**: NoSQL / Document DB (原生支持强 JSON)
