## 1. 存储架构 (Storage Architecture)

### 1.1 非关系型基础 (NoSQL Foundation)
- **核心引擎**：采用文档级数据库（Document Store）作为主存储，能够原生处理复杂的嵌套 JSON 结构。
- **强 JSON 支持**：所有业务对象（客户、组织、需求）均以结构化 JSON 形式存储，支持高效的局部更新与索引。
- **非规范化设计 (Denormalization)**：为了追求查询性能与灵活性，允许适度的冗余存储，减少跨表关联（Joins）。

## 2. 逻辑模型 (Logical Model)

### 2.1 组织结构模型 (Organization Tree)
- **核心实体**：`OrganizationNode`
- **特性**：
    - 递归定义：每个节点可拥有父节点，形成树状结构。
    - 自由组织：业务层面上不设深度限制。
    - **视图模型 (View Publishing)**：
        - `DraftView`：个人编辑中的草稿。
        - `PublicView`：正式发布的公共视图。
        - `PrivateView`：特定的私有视图。
    - **逻辑说明**：发布操作需将 `DraftView` 的快照转换为相应的发布状态。

### 2.2 远程连接参数化 (Remote Connection Parameterization)
- **设计目标**：从非结构化文字说明向结构化数据演进。
- **参数源 (Parameter Source)**：
    - 定义统一的 JSON/YAML Schema。
    - 包含：`Protocol`, `Address`, `Port`, `Credentials_Ref`, `Custom_Args`。
    - **集成**：作为“一键连接”工具的动态参数源。

## 3. AI 驱动的多语言引擎 (Dynamic I18n Engine)

### 3.1 词条生命周期 (Keyphrase Lifecycle)
1. **捕获 (Capture)**：当前端渲染页面时，拦截所有标记为可翻译的词条。
2. **检测 (Detection)**：检查当前选择语言的字典中是否存在该词条。
3. **队列 (Queueing)**：若词条缺失，按**画面呈现顺序**压入 AI 翻译队列。
4. **AI 翻译 (AI Execution)**：后台调用 AI 模型进行上下文感知的精准翻译。
5. **异步持久化 (Async Persistence)**：翻译完成后异步更新至 `I18nDictionary` 数据源。
6. **热刷新 (Hot Reload)**：翻译成功后触发局部 UI 刷新。

### 3.2 自愈机制 (Self-Healing)
- **按需触发**：当用户切换至未完全翻译的语言时，系统自动启动后台扫描。
- **进度覆盖**：当所有已知词条均有对应翻译时，该语言标记为“已覆盖 (Fully Covered)”。

## 4. 文件与汇总逻辑 (File & Summary Logic)
- **组件化管理**：所有带“多文件及各汇总”的模块共用同一套底层文件关联引擎。
- **汇总计算层**：
    - 动态扫描模块关联的文件。
    - 提取文件元数据（如版本、大小、上传人）。
    - 自动生成汇总报告（如：该客户共 5 份产品客户化文档，最后更新于 X 日）。

## 5. 灵活页面引擎 (Dynamic Page Engine)
- **实现方案**：底层采用 Grid 系统。
- **配置驱动**：各 Tab 下的内容卡片顺序与布局由配置定义，支持管理员或用户级别的局部重构。

## 6. 技术标准 (Technical Standards)
- **AUTH_LOGIC**: Fail-Open Resilience (见 user_rules)。
- **SQL_POLICY**: NO_PHYSICAL_SQL (使用 Logical_Model/Entity 映射)。
