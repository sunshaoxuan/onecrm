# OneCRM 后端需求清单 (Backend Requirement List)

本文档整理了前端框架在 Mock 实现过程中明确的后端 API 需求。所有接口均为 JSON 格式，采用 RESTful 或简洁的 Action 风格。

## 1. 基础服务 (Core Services)

### 1.1 用户信息 (User Info)
- **接口说明**：获取当前登录用户的基本信息。
- **字段要求**：`id`, `name`, `email`, `avatar` (可选)。

### 1.2 客户检索 (Customer Search)
- **接口说明**：左侧面板搜索与列表展示。
- **字段要求**：`id`, `code` (CUST-NNN), `name`, `shortName`, `industry`, `type` (VIP, Normal)。

## 2. 客户工作台 (Customer Portal)

### 2.1 客户汇总概览 (Portal Summary)
- **接口说明**：头部 Hero Header 与核心统计项。
- **字段要求**：`id`, `name`, `activeUnits`, `contractValue`, `healthScore` (AI 计算得分)。

### 2.2 组织架构 (Organization Structure)
- **接口说明**：返回树形结构的组织节点。
- **字段要求**：`id`, `label`, `children` (递归结构), `type` (Dept, Person)。

### 2.3 远程连接管理 (Remote Connections)
- **接口说明**：列出该客户的所有远程接入终端。
- **字段要求**：`id`, `name`, `status` (ONLINE, OFFLINE), `lastPring`, `ip`。

### 2.4 签约管理 (Contract Management)
- **接口说明**：获取合同列表及 AI 生成的摘要。
- **字段要求**：`id`, `contractNo`, `signDate`, `amount`, `status` (ACTIVE, EXPIRED), `aiSummary` (AI 异步生成)。

## 3. 技术规范与建议

- **认证方式**：建议采用 JWT 方案，支持 Fail-Open 柔性降级（见 `ARCH-01`）。
- **数据一致性**：鉴于部分字段（如 AI 摘要）依赖 Dify 生成，后端需支持 Webhook 或 轮询状态位。
- **性能预期**：列表查询建议支持分页与分级加载，特别是组织树结构。
