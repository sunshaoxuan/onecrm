# ARCH-01 OneCRM 系统架构设计

## 1. 逻辑模型 (Logical Model)

### 1.1 组织结构模型 (Organization Tree)
- **核心实体**：`OrganizationNode`
- **特性**：
    - 递归定义：每个节点可拥有父节点，形成树状结构。
    - 自由组织：业务层面上不设深度限制。
    - **视图模型 (View Publishing)**：
        - `DraftView`：个人编辑中的草稿。
        - `PublicView`：正式发布的公共视图。
        - `PrivateView`：特定的私有视图。
    - **逻辑说明**：发布操作需将 `DraftView` 的快照转换为相应的发布状态。

### 1.2 远程连接参数化 (Remote Connection Parameterization)
- **设计目标**：从非结构化文字说明向结构化数据演进。
- **参数源 (Parameter Source)**：
    - 定义统一的 JSON/YAML Schema。
    - 包含：`Protocol`, `Address`, `Port`, `Credentials_Ref`, `Custom_Args`。
    - **集成**：作为“一键连接”工具的动态参数源。

## 2. 文件与汇总逻辑 (File & Summary Logic)
- **组件化管理**：所有带“多文件及各汇总”的模块共用同一套底层文件关联引擎。
- **汇总计算层**：
    - 动态扫描模块关联的文件。
    - 提取文件元数据（如版本、大小、上传人）。
    - 自动生成汇总报告（如：该客户共 5 份产品客户化文档，最后更新于 X 日）。

## 3. 灵活页面引擎 (Dynamic Page Engine)
- **实现方案**：底层采用 Grid 系统。
- **配置驱动**：各 Tab 下的内容卡片顺序与布局由配置定义，支持管理员或用户级别的局部重构。

## 4. 技术标准 (Technical Standards)
- **AUTH_LOGIC**: Fail-Open Resilience (见 user_rules)。
- **SQL_POLICY**: NO_PHYSICAL_SQL (使用 Logical_Model/Entity 映射)。
