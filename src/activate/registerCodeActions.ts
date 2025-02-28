import * as vscode from "vscode"

import { ACTION_NAMES, COMMAND_IDS } from "../core/CodeActionProvider"
import { EditorUtils } from "../core/EditorUtils"
import { ClineProvider } from "../core/webview/ClineProvider"

export const registerCodeActions = (context: vscode.ExtensionContext) => {
	registerCodeActionPair(
		context,
		COMMAND_IDS.EXPLAIN,
		"EXPLAIN",
		"Roo需要解释什么?", // 提示用户输入想要解释的内容
		"例如：错误处理是如何工作的?", // 输入框的占位符示例
	)

	registerCodeActionPair(
		context,
		COMMAND_IDS.FIX,
		"FIX",
		"Roo需要修复什么?", // 提示用户输入想要修复的内容
		"例如: 维护向后兼容性", // 输入框的占位符示例
	)

	registerCodeActionPair(
		context,
		COMMAND_IDS.IMPROVE,
		"IMPROVE",
		"Roo需要改进什么?", // 提示用户输入想要改进的内容
		"例如: 专注于性能优化", // 输入框的占位符示例
	)

	registerCodeAction(context, COMMAND_IDS.ADD_TO_CONTEXT, "ADD_TO_CONTEXT") // 注册 ADD_TO_CONTEXT 动作
}

const registerCodeAction = (
	context: vscode.ExtensionContext,
	command: string,
	promptType: keyof typeof ACTION_NAMES,
	inputPrompt?: string,
	inputPlaceholder?: string,
) => {
	let userInput: string | undefined // 用户输入

	context.subscriptions.push(
		vscode.commands.registerCommand(command, async (...args: any[]) => {
			// 注册命令
			if (inputPrompt) {
				// 如果有输入提示
				userInput = await vscode.window.showInputBox({
					prompt: inputPrompt, // 显示提示
					placeHolder: inputPlaceholder, // 显示占位符
				})
			}

			// 处理代码动作和直接命令的情况
			let filePath: string
			let selectedText: string
			let diagnostics: any[] | undefined

			if (args.length > 1) {
				// 如果有多个参数
				// 从代码动作调用
				;[filePath, selectedText, diagnostics] = args
			} else {
				// 从命令面板直接调用
				const context = EditorUtils.getEditorContext() // 获取编辑器上下文
				if (!context) return
				;({ filePath, selectedText, diagnostics } = context)
			}

			const params = {
				...{ filePath, selectedText },
				...(diagnostics ? { diagnostics } : {}),
				...(userInput ? { userInput } : {}),
			}

			await ClineProvider.handleCodeAction(command, promptType, params) // 处理代码动作
		}),
	)
}

const registerCodeActionPair = (
	context: vscode.ExtensionContext,
	baseCommand: string,
	promptType: keyof typeof ACTION_NAMES,
	inputPrompt?: string,
	inputPlaceholder?: string,
) => {
	// 注册新任务版本
	registerCodeAction(context, baseCommand, promptType, inputPrompt, inputPlaceholder)

	// 注册当前任务版本
	registerCodeAction(context, `${baseCommand}InCurrentTask`, promptType, inputPrompt, inputPlaceholder)
}
