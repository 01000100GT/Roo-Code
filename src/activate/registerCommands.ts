import * as vscode from "vscode" // 导入vscode模块
import delay from "delay" // 导入delay模块

import { ClineProvider } from "../core/webview/ClineProvider" // 导入ClineProvider类

export type RegisterCommandOptions = {
	// 定义RegisterCommandOptions类型
	context: vscode.ExtensionContext // 扩展上下文
	outputChannel: vscode.OutputChannel // 输出通道
	provider: ClineProvider // ClineProvider实例
}

export const registerCommands = (options: RegisterCommandOptions) => {
	// 注册命令的函数
	const { context, outputChannel } = options // 解构获取context和outputChannel

	for (const [command, callback] of Object.entries(getCommandsMap(options))) {
		// 遍历命令映射
		context.subscriptions.push(vscode.commands.registerCommand(command, callback)) // 注册命令并添加到订阅中
	}
}

const getCommandsMap = ({ context, outputChannel, provider }: RegisterCommandOptions) => {
	// 获取命令映射的函数
	return {
		"roo-cline.plusButtonClicked": async () => {
			// 定义plusButtonClicked命令
			await provider.clearTask() // 清除任务
			await provider.postStateToWebview() // 将状态发送到webview
			await provider.postMessageToWebview({ type: "action", action: "chatButtonClicked" }) // 发送chatButtonClicked消息到webview
		},
		"roo-cline.mcpButtonClicked": () => {
			// 定义mcpButtonClicked命令
			provider.postMessageToWebview({ type: "action", action: "mcpButtonClicked" }) // 发送mcpButtonClicked消息到webview
		},
		"roo-cline.promptsButtonClicked": () => {
			// 定义promptsButtonClicked命令
			provider.postMessageToWebview({ type: "action", action: "promptsButtonClicked" }) // 发送promptsButtonClicked消息到webview
		},
		"roo-cline.popoutButtonClicked": () => openClineInNewTab({ context, outputChannel }), // 定义popoutButtonClicked命令，调用openClineInNewTab函数
		"roo-cline.openInNewTab": () => openClineInNewTab({ context, outputChannel }), // 定义openInNewTab命令，调用openClineInNewTab函数
		"roo-cline.settingsButtonClicked": () => {
			// 定义settingsButtonClicked命令
			provider.postMessageToWebview({ type: "action", action: "settingsButtonClicked" }) // 发送settingsButtonClicked消息到webview
		},
		"roo-cline.historyButtonClicked": () => {
			// 定义historyButtonClicked命令
			provider.postMessageToWebview({ type: "action", action: "historyButtonClicked" }) // 发送historyButtonClicked消息到webview
		},
		"roo-cline.helpButtonClicked": () => {
			// 定义helpButtonClicked命令
			vscode.env.openExternal(vscode.Uri.parse("https://docs.roocode.com")) // 打开帮助文档的外部链接
		},
	}
}
const openClineInNewTab = async ({ context, outputChannel }: Omit<RegisterCommandOptions, "provider">) => {
	outputChannel.appendLine("正在打开新的Roo Code标签页") // 输出日志信息，表示正在打开新的Roo Code标签页

	// （此示例使用webviewProvider激活事件，这对于反序列化缓存的webview是必要的，
	// 但由于我们使用retainContextWhenHidden，因此不需要使用该事件）。
	// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/src/extension.ts
	const tabProvider = new ClineProvider(context, outputChannel) // 创建一个新的ClineProvider实例
	// const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined
	const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0)) // 获取当前可见编辑器的最大列数

	// 检查是否有可见的文本编辑器，否则在右侧打开一个新的组。
	const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0 // 判断是否有可见的文本编辑器

	if (!hasVisibleEditors) {
		// 如果没有可见的文本编辑器
		await vscode.commands.executeCommand("workbench.action.newGroupRight") // 在右侧创建一个新的编辑器组
	}

	const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two // 确定目标列

	const panel = vscode.window.createWebviewPanel(ClineProvider.tabPanelId, "Roo Code", targetCol, {
		// 创建一个新的webview面板
		enableScripts: true, // 允许在webview中运行脚本
		retainContextWhenHidden: true, // 当webview隐藏时保留上下文
		localResourceRoots: [context.extensionUri], // 设置本地资源的根路径
	})

	// TODO: 使用更好的svg图标，具有亮和暗的变体（参见
	// https://stackoverflow.com/questions/58365687/vscode-extension-iconpath）。
	panel.iconPath = {
		// 设置面板的图标路径
		light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "rocket.png"), // 亮色主题图标路径
		dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "rocket.png"), // 暗色主题图标路径
	}

	await tabProvider.resolveWebviewView(panel) // 解析webview视图

	// 锁定编辑器组，以便点击文件不会在面板上打开它们
	await delay(100) // 延迟100毫秒
	await vscode.commands.executeCommand("workbench.action.lockEditorGroup") // 锁定编辑器组
}
