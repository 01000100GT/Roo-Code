# Roo Code API

Roo Code扩展提供了一个可供其他扩展使用的API。要在您的扩展中使用此API：

1. 将`src/extension-api/roo-code.d.ts`复制到您扩展的源目录中。
2. 在您扩展的编译中包含`roo-code.d.ts`。
3. 使用以下代码获取API访问权限：

```typescript
const extension = vscode.extensions.getExtension<RooCodeAPI>("rooveterinaryinc.roo-cline")

if (!extension?.isActive) {
	throw new Error("Extension is not activated")
}

const api = extension.exports

if (!api) {
	throw new Error("API is not available")
}

// 使用初始消息开始新任务
await api.startNewTask("你好，Roo Code API！让我们创建一个新项目...")

// 使用初始消息和图片开始新任务
await api.startNewTask("使用这种设计语言", ["data:image/webp;base64,..."])

// 向当前任务发送消息
await api.sendMessage("您能修复@problems吗？")

// 模拟在聊天界面中按下主按钮（例如"保存"或"强制继续"）
await api.pressPrimaryButton()

// 模拟在聊天界面中按下次要按钮（例如"拒绝"）
await api.pressSecondaryButton()
```

**注意：** 为确保在您的扩展之前激活`rooveterinaryinc.roo-cline`扩展，请将其添加到您的`package.json`中的`extensionDependencies`：

```json
"extensionDependencies": ["rooveterinaryinc.roo-cline"]
```

有关可用方法及其用法的详细信息，请参阅`roo-code.d.ts`文件。 