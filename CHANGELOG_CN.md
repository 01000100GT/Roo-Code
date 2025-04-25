# Roo Code 更新日志

## [3.12.3] - 2025-04-17

- 修复 Gemini 差异编辑中的字符转义问题
- 支持将标签页拖放到聊天框中（感谢 @NyxJae！）
- 确保斜杠命令仅在聊天框开头触发（感谢 @logosstone！）

## [3.12.2] - 2025-04-16

- 添加 OpenAI o3 和 4o-mini（感谢 @PeterDaveHello！）
- 改进文件/文件夹上下文提及的 UI（感谢 @elianiva！）
- 改进差异错误遥测

## [3.12.1] - 2025-04-16

- 修复选择下拉菜单中编辑按钮可见性的问题

## [3.12.0] - 2025-04-15

- 添加 xAI 提供商并公开 OpenRouter 上 Grok 的推理努力选项（感谢 Cline！）
- 使差异编辑配置按配置文件设置，并改进预差异字符串标准化
- 使存档点更快速可靠
- 为模式和配置文件选择下拉菜单添加搜索栏（感谢 @samhvw8！）
- 添加代码操作使用、提示增强使用和连续错误的遥测
- 在任务标题中隐藏零成本值（感谢 @do-it！）
- 使 JSON 解析更安全，避免在错误输入时使 webview 崩溃
- 允许用户为接受聊天视图中的建议或输入绑定键盘快捷键（感谢 @axkirillov！）

## [3.11.17] - 2025-04-14

- 改进 OpenAI 缓存报告和成本估算（感谢 @monotykamary 和 Cline！）
- 自动批准开关的视觉改进（感谢 @sachasayan！）
- 修复差异应用逻辑的错误（感谢 @avtc 提供测试用例！）并添加遥测以跟踪未来的错误
- 修复捕获短时间运行终端命令的竞争条件（感谢 @KJ7LNW！）
- 修复 eslint 错误（感谢 @nobu007！）

## [3.11.16] - 2025-04-14

- 在 OpenAI 提供商中添加 gpt-4.1、gpt-4.1-mini 和 gpt-4.1-nano
- 在环境详情和导出任务时包含模型 ID（感谢 @feifei325！）

## [3.11.15] - 2025-04-13

- 添加按工作区筛选任务历史的功能（感谢 @samhvw8！）
- 修复 .tool-versions 文件中的 Node.js 版本（感谢 @bogdan0083！）
- 修复打开标签页的重复建议提及（感谢 @samhvw8！）
- 修复使用配置文件时的 Bedrock ARN 验证和令牌过期问题（感谢 @vagadiya！）
- 添加 Anthropic 选项，可将 API 令牌作为 Authorization 标头传递，而非 X-Api-Key（感谢 @mecab！）
- 改进添加新设置的文档（感谢 @KJ7LNW！）
- 本地化 package.json（感谢 @samhvw8！）
- 添加隐藏欢迎消息的选项，并修复新配置文件对话框的背景颜色（感谢 @zhangtony239！）
- 恢复 VSCodeButton 组件的焦点环（感谢 @pokutuna！）

## [3.11.14] - 2025-04-11

- 支持规则文件夹中指向目录和其他符号链接的符号链接（感谢 @taisukeoe！）
- 加强始终读取完整文件而非部分读取的设置执行

## [3.11.13] - 2025-04-11

- 大量终端改进：命令延迟、PowerShell 计数器和 ZSH EOL 标记（感谢 @KJ7LNW！）
- 添加文件上下文跟踪系统（感谢 @samhvw8 和 @canvrno！）
- 改进差异错误显示 + 方便复制以便调查
- 修复 .vscodeignore（感谢 @franekp！）
- 修复模型能力的中文翻译（感谢 @zhangtony239！）
- 将 AWS Bedrock 重命名为 Amazon Bedrock（感谢 @ronyblum！）
- 更新扩展标题和描述（感谢 @StevenTCramer！）

## [3.11.12] - 2025-04-09

- 使 Grok3 流式处理与 OpenAI Compatible 一起工作（感谢 @amittell！）
- 调整差异编辑逻辑，使其更能容忍模型错误

## [3.11.11] - 2025-04-09

- 修复高亮与模式/配置文件下拉菜单的交互（感谢 @atlasgong！）
- 在 OpenAI 兼容提供商中添加设置 Host 标头和旧版 OpenAI API 的功能，以获得更好的代理支持
- 改进 TypeScript、C++、Go、Java、Python 的 tree-sitter 解析器（感谢 @KJ7LNW！）
- 修复终端工作目录逻辑（感谢 @KJ7LNW！）
- 改进 readFileTool XML 输出格式（感谢 @KJ7LNW！）
- 添加 o1-pro 支持（感谢 @arthurauffray！）
- 关注符号链接规则文件/目录，允许更灵活的规则设置
- 通过 API 在侧边栏中运行任务时，在侧边栏中聚焦 Roo Code
- 改进子任务 UI

## [3.11.10] - 2025-04-08

- 修复嵌套 .roo/rules 目录无法正确识别的错误（感谢 @taisukeoe！）
- 在聊天行中更高效地处理长命令输出（感谢 @samhvw8！）
- 修复 OpenAI 兼容提供商的缓存使用跟踪
- 添加 zh-CN 的自定义翻译指南（感谢 @System233！）
- 在使频率限制按配置文件设置后清理代码（感谢 @ross！）

## [3.11.9] - 2025-04-07

- 频率限制设置更新为按配置文件设置（感谢 @ross 和 @olweraltuve！）
- 现在可以在 .roo/rules/ 和 .roo/rules-{mode}/ 文件夹中放置多个规则文件（感谢 @upamune！）
- 防止按钮出现时不必要的自动滚动（感谢 @shtse8！）
- 在 Vertex AI 中添加 Gemini 2.5 Pro Preview（感谢 @nbihan-mediware！）
- 在 ClineProvider 重构后整理（感谢 @diarmidmackenzie！）
- 读取文件时限制负行号（感谢 @KJ7LNW！）
- 使用高级语言结构增强 Rust tree-sitter 解析器（感谢 @KJ7LNW！）
- 在 api.setConfiguration 上保留设置（感谢 @gtaylor！）
- 添加到设置部分的深层链接
- 添加聚焦 Roo Code 输入字段的命令（感谢 @axkirillov！）
- 为浏览器添加调整大小和悬停操作（感谢 @SplittyDev！）
- 向 API 添加 resumeTask 和 isTaskInHistory（感谢 @franekp！）
- 修复显示布尔/数字建议答案的错误
- webview 开发的动态 Vite 端口检测（感谢 @KJ7LNW！）

## [3.11.8] - 2025-04-05

- 改进 combineApiRequests 性能以减少灰屏死机（感谢 @kyle-apex！）
- 在设置屏幕上为 API 配置配置文件添加可搜索下拉菜单（感谢 @samhvw8！）
- 为历史记录项添加工作区跟踪，为未来筛选做准备（感谢 @samhvw8！）
- 修复历史搜索中的搜索高亮 UI（感谢 @samhvw8！）
- 添加对 .roorules 的支持，并为 .clinerules 提供弃用警告（感谢 @upamune！）
- 修复 .tool-versions 文件中的 nodejs 版本格式（感谢 @upamune！）

## [3.11.7] - 2025-04-04

- 改进文件工具上下文格式化和差异错误指导
- 改进繁体中文本地化（感谢 @PeterDaveHello！）
- 实现 McpHub 处理的引用计数
- 更新按钮以保持一致性（感谢 @kyle-apex！）
- 改进简体中文本地化（感谢 @System233！）

## [3.11.6] - 2025-04-04

- 添加 gemini 2.5 pro preview 模型，带上限定价

## [3.11.5] - 2025-04-03

- 为 Amazon Bedrock 添加提示词缓存（感谢 @Smartsheet-JB-Brown！）
- 添加配置 MCP 服务器当前工作目录的支持（感谢 @shoopapa！）
- 向 API 添加配置文件管理功能（感谢 @gtaylor！）
- 改进差异编辑功能、测试和错误消息（感谢 @p12tic！）
- 修复跟进问题抢夺焦点的问题（感谢 @diarmidmackenzie！）
- 将扩展弹出到新标签页时显示菜单按钮（感谢 @benny123tw！）

## [3.11.4] - 2025-04-02

- 在当前任务被清除时正确将状态发送到 webview（感谢 @wkordalski！）
- 修复单元测试以在 Windows 上正常运行（感谢 @StevenTCramer！）
- Tree-sitter 增强：支持 TSX、TypeScript、JSON 和 Markdown（感谢 @KJ7LNW！）
- 修复 apply_diff 中删除行号剥离的问题
- 更新历史选择模式按钮间距（感谢 @kyle-apex！）
- 将下拉菜单高度限制为视口的 80%（感谢 @axmo！）
- 通过 `npm audit fix` 更新依赖项（感谢 @PeterDaveHello！）
- 在 API 失败时启用模型选择（感谢 @kyle-apex！）
- 修复从下拉菜单访问时提示和设置标签无法滚动的问题
- 将 AWS 区域下拉菜单更新为最新数据（感谢 @Smartsheet-JB-Brown！）
- 修复 Bedrock 的提示增强（感谢 @Smartsheet-JB-Brown！）
- 允许进程通过 unix 套接字访问 Roo Code API
- 改进繁体中文翻译（感谢 @PeterDaveHello！）
- 添加对带有 DeepSeek-V3 模型的 Azure AI 推理服务的支持（感谢 @thomasjeung！）
- 修复 tree-sitter 行号中的差一错误
- 移除实验性统一差异
- 使扩展图标在不同主题中更加可见

## [3.11.3] - 2025-03-31

- 恢复提及更改，以防它们导致性能问题/崩溃

## [3.11.2] - 2025-03-31

- 修复加载 Requesty 密钥余额的错误
- 修复 Bedrock 推理配置文件的错误
- 通过 API 更改设置时更新 webview
- 重构 webview 消息代码（感谢 @diarmidmackenzie！）

## [3.11.1] - 2025-03-30

- 放宽提供商配置文件模式并添加遥测

## [3.11.0] - 2025-03-30

- 用多块差异快速编辑策略替换单块差异
- 在 .roo/mcp.json 中支持项目级 MCP 配置（感谢 @aheizi！）
- 在设置屏幕上显示 OpenRouter 和 Requesty 密钥余额
- 支持设置的导入/导出
- 为 API 配置下拉菜单添加固定和排序功能（感谢 @jwcraig！）
- 向 GCP Vertex AI 提供商添加 Gemini 2.5 Pro（感谢 @nbihan-mediware！）
- 更智能的 Gemini 重试逻辑
- 修复 Gemini 命令转义
- 支持带空格名称的文件的 @-提及（感谢 @samhvw8！）
- 改进部分文件读取（感谢 @KJ7LNW！）
- 修复 list_code_definition_names 以支持文件（感谢 @KJ7LNW！）
- 重构工具调用逻辑，使代码更易于使用（感谢 @diarmidmackenzie、@bramburn、@KJ7LNW 以及所有其他帮助的人！）
- 在代码操作中优先考虑"添加到上下文"并包含行号（感谢 @samhvw8！）
- 添加其他扩展可用于与 Roo Code 交互的激活命令（感谢 @gtaylor！）
- 在文件 @-提及中保留语言字符（感谢 @aheizi！）
- 浏览器工具改进（感谢 @afshawnlotfi！）
- 在聊天行中显示部分读取的信息
- 从自动批准工具栏链接到设置页面
- 从提供商选项链接到提供商文档
- 修复切换配置文件以确保仅切换所选配置文件（感谢 @feifei325！）
- 允许来自 OpenAI 兼容提供商的自定义 o3-mini-<reasoning> 模型（感谢 @snoyiatk！）
- 在接受建议答案前编辑它们（感谢 @samhvw8！） 