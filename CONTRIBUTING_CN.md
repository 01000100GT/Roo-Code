# 为Roo Code做贡献

我们很高兴你有兴趣为Roo Code做贡献。无论你是修复bug、添加功能还是改进我们的文档，每一项贡献都让Roo Code变得更智能！为了保持我们的社区充满活力和友好，所有成员必须遵守我们的[行为准则](CODE_OF_CONDUCT_CN.md)。

## 加入我们的社区

我们强烈鼓励所有贡献者加入我们的[Discord社区](https://discord.gg/roocode)！成为我们Discord服务器的一部分可以帮助你：

- 获得关于你的贡献的实时帮助和指导
- 与其他贡献者和核心团队成员联系
- 了解项目的最新发展和优先事项
- 参与塑造Roo Code未来的讨论
- 寻找与其他开发者的合作机会

## 报告Bug或问题

Bug报告有助于让Roo Code变得对每个人都更好！在创建新的问题之前，请[搜索现有问题](https://github.com/RooVetGit/Roo-Code/issues)以避免重复。当你准备报告bug时，请前往我们的[问题页面](https://github.com/RooVetGit/Roo-Code/issues/new/choose)，那里有一个模板可以帮助你填写相关信息。

<blockquote class='warning-note'>
     🔐 <b>重要提示：</b> 如果你发现安全漏洞，请使用<a href="https://github.com/RooVetGit/Roo-Code/security/advisories/new">Github安全工具私下报告</a>。
</blockquote>

## 决定做什么

寻找一个好的首次贡献？查看我们的[Roo Code Issues](https://github.com/orgs/RooVetGit/projects/1) Github项目中"Issue [Unassigned]"部分的问题。这些都是专门为新贡献者准备的，也是我们希望得到一些帮助的领域！

我们也欢迎对我们的[文档](https://docs.roocode.com/)做出贡献！无论是修复拼写错误、改进现有指南，还是创建新的教育内容 - 我们都希望建立一个社区驱动的资源库，帮助每个人充分利用Roo Code。你可以点击任何页面上的"编辑此页面"，快速找到Github中编辑文件的正确位置，或者直接访问https://github.com/RooVetGit/Roo-Code-Docs。

如果你计划开发一个更大的功能，请先创建一个[功能请求](https://github.com/RooVetGit/Roo-Code/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop)，以便我们讨论它是否符合Roo Code的愿景。你也可以查看下面的[项目路线图](#项目路线图)，看看你的想法是否符合我们的战略方向。

## 项目路线图

Roo Code有一个明确的开发路线图，指导我们的优先事项和未来方向。了解我们的路线图可以帮助你：

- 将你的贡献与项目目标保持一致
- 确定你的专业知识最有价值的领域
- 理解某些设计决策背后的背景
- 为支持我们愿景的新功能寻找灵感

我们当前的路线图专注于六个关键支柱：

### 提供商支持

我们的目标是尽可能好地支持尽可能多的提供商：

- 更多功能的"OpenAI兼容"支持
- xAI、Microsoft Azure AI、阿里云Qwen、IBM Watsonx、Together AI、DeepInfra、Fireworks AI、Cohere、Perplexity AI、FriendliAI、Replicate
- 增强对Ollama和LM Studio的支持

### 模型支持

我们希望Roo能够在尽可能多的模型上工作得很好，包括本地模型：

- 通过自定义系统提示和工作流程支持本地模型
- 基准评估和测试用例

### 系统支持

我们希望Roo在每个人的计算机上都运行良好：

- 跨平台终端集成
- 对Mac、Windows和Linux的强大一致支持

### 文档

我们希望为所有用户和贡献者提供全面、易于访问的文档：

- 扩展的用户指南和教程
- 清晰的API文档
- 更好的贡献者指导
- 多语言文档资源
- 交互式示例和代码样本

### 稳定性

我们希望显著减少错误数量并增加自动化测试：

- 调试日志开关
- "机器/任务信息"复制按钮，用于发送bug/支持请求

### 国际化

我们希望Roo能说每个人的语言：

- 我们希望 Roo Code 说每个人的语言
- Queremos que Roo Code hable el idioma de todos
- हम चाहते हैं कि Roo Code हर किसी की भाषा बोले
- نريد أن يتحدث Roo Code لغة الجميع

我们特别欢迎推进我们路线图目标的贡献。如果你正在开发与这些支柱相符的内容，请在你的PR描述中提及。

## 开发设置

1. **克隆**仓库：

```sh
git clone https://github.com/RooVetGit/Roo-Code.git
```

2. **安装依赖**：

```sh
npm run install:all
```

3. **启动webview（Vite/React应用，支持热模块替换）**：

```sh
npm run dev
```

4. **调试**：
   在VSCode中按`F5`（或**运行** → **开始调试**）以打开一个加载了Roo Code的新会话。

对webview的更改将立即显示。对核心扩展的更改将需要重启扩展主机。

或者，你可以构建一个.vsix并直接在VSCode中安装：

```sh
npm run build
```

一个`.vsix`文件将出现在`bin/`目录中，可以使用以下命令安装：

```sh
code --install-extension bin/roo-cline-<version>.vsix
```

## 编写和提交代码

任何人都可以为Roo Code贡献代码，但我们要求你遵循这些指南，以确保你的贡献可以顺利集成：

1. **保持Pull Requests专注**

    - 限制PR到单个功能或bug修复
    - 将更大的更改分成更小的相关PR
    - 将更改分解为可以独立审查的逻辑提交

2. **代码质量**

    - 所有PR必须通过包括代码检查和格式化的CI检查
    - 在提交前解决任何ESLint警告或错误
    - 响应来自Ellipsis（我们的自动代码审查工具）的所有反馈
    - 遵循TypeScript最佳实践并维护类型安全

3. **测试**

    - 为新功能添加测试
    - 运行`npm test`确保所有测试通过
    - 如果你的更改影响现有测试，请更新它们
    - 在适当的地方包括单元测试和集成测试

4. **提交指南**

    - 写清晰、描述性的提交消息
    - 在提交中使用#issue-number引用相关问题

5. **提交前**

    - 在最新的main分支上rebase你的分支
    - 确保你的分支成功构建
    - 再次检查所有测试是否通过
    - 检查你的更改中是否有任何调试代码或控制台日志

6. **Pull Request描述**
    - 清楚地描述你的更改做了什么
    - 包括测试更改的步骤
    - 列出任何破坏性更改
    - 为UI更改添加截图

## 贡献协议

通过提交pull request，你同意你的贡献将根据与项目相同的许可证（[Apache 2.0](LICENSE)）进行许可。 