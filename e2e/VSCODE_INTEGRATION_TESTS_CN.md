# VSCode 集成测试

本文档描述了 Roo Code VSCode 扩展的集成测试设置。

## 概述

集成测试使用 `@vscode/test-electron` 包在真实的 VSCode 环境中运行测试。这些测试验证扩展在 VSCode 中的正确工作，包括模式切换、网页视图交互和 API 通信等功能。

## 测试设置

### 目录结构

```
e2e/src/
├── runTest.ts          # 主测试运行器
├── suite/
│   ├── index.ts        # 测试套件配置
│   ├── modes.test.ts   # 模式切换测试
│   ├── tasks.test.ts   # 任务执行测试
│   └── extension.test.ts # 扩展激活测试
```

### 测试运行器配置

测试运行器（`runTest.ts`）负责：

- 设置扩展开发路径
- 配置测试环境
- 使用 `@vscode/test-electron` 运行集成测试

### 环境设置

1. 在根目录中创建一个包含所需环境变量的 `.env.local` 文件：

```
OPENROUTER_API_KEY=sk-or-v1-...
```

2. 测试套件（`suite/index.ts`）配置：

- 使用 TDD 接口的 Mocha 测试框架
- 10 分钟超时用于 LLM 通信
- 全局扩展 API 访问
- WebView 面板设置
- OpenRouter API 配置

## 测试套件结构

测试使用 Mocha 的 TDD 接口（`suite` 和 `test` 函数）组织。主要测试文件包括：

- `modes.test.ts`：测试模式切换功能
- `tasks.test.ts`：测试任务执行
- `extension.test.ts`：测试扩展激活

### 全局对象

测试中可用以下全局对象：

```typescript
declare global {
	var api: RooCodeAPI
	var provider: ClineProvider
	var extension: vscode.Extension<RooCodeAPI>
	var panel: vscode.WebviewPanel
}
```

## 运行测试

1. 确保在 `.env.local` 中设置了所需的环境变量

2. 运行集成测试：

```bash
npm run test:integration
```

3. 如果要运行特定测试，可以在测试文件中使用 `test.only` 函数。这将只运行您指定的测试并忽略其他测试。请确保在提交更改前删除 `test.only` 函数。

测试将：

- 下载并启动一个干净的 VSCode 实例
- 安装扩展
- 执行测试套件
- 报告结果

## 编写新测试

编写新的集成测试时：

1. 在 `src/test/suite/` 中创建一个具有 `.test.ts` 扩展名的新测试文件

2. 使用 TDD 接口构建测试：

```typescript
import * as assert from "assert"
import * as vscode from "vscode"

suite("您的测试套件名称", () => {
	test("应该执行特定操作", async function () {
		// 您的测试代码
	})
})
```

3. 使用全局对象（`api`、`provider`、`extension`、`panel`）与扩展交互

### 最佳实践

1. **超时**：为异步操作使用适当的超时：

```typescript
const timeout = 30000
const interval = 1000
```

2. **状态管理**：在测试前/后重置扩展状态：

```typescript
await globalThis.api.setConfiguration({
	mode: "Ask",
	alwaysAllowModeSwitch: true,
})
```

3. **断言**：使用具有有意义消息的明确断言：

```typescript
assert.ok(condition, "关于失败原因的描述性消息")
```

4. **错误处理**：将测试代码包装在 try/catch 块中并清理资源：

```typescript
try {
	// 测试代码
} finally {
	// 清理代码
}
```

5. **等待操作**：等待异步操作时使用轮询：

```typescript
let startTime = Date.now()

while (Date.now() - startTime < timeout) {
	if (condition) {
		break
	}

	await new Promise((resolve) => setTimeout(resolve, interval))
}
```

6. **评分**：评分测试时，使用 `Grade:` 格式确保测试正确评分（参见 modes.test.ts 示例）。

```typescript
await globalThis.api.startNewTask({
	text: `给定这个提示：${testPrompt} 对响应进行 1 到 10 的评分，格式为 "Grade: (1-10)"：${output} \n 确保在任务完成后说 'I AM DONE GRADING'`,
})
``` 