import * as vscode from "vscode" // 导入 VSCode 模块

import { ClineProvider } from "../core/webview/ClineProvider" // 导入 ClineProvider 模块

export const handleUri = async (uri: vscode.Uri) => {
	// 定义异步函数 handleUri，用于处理 URI
	const path = uri.path // 获取 URI 的路径部分
	const query = new URLSearchParams(uri.query.replace(/\+/g, "%2B")) // 解析 URI 的查询参数，并替换加号
	const visibleProvider = ClineProvider.getVisibleInstance() // 获取当前可见的 ClineProvider 实例

	if (!visibleProvider) {
		// 如果没有可见的 ClineProvider 实例
		return // 直接返回
	}

	switch (
		path // 根据路径进行不同的处理
	) {
		case "/glama": {
			// 如果路径是 "/glama"
			const code = query.get("code") // 获取查询参数中的 "code"
			if (code) {
				// 如果 code 存在
				await visibleProvider.handleGlamaCallback(code) // 调用 handleGlamaCallback 处理 code
			}
			break // 结束此 case
		}
		case "/openrouter": {
			// 如果路径是 "/openrouter"
			const code = query.get("code") // 获取查询参数中的 "code"
			if (code) {
				// 如果 code 存在
				await visibleProvider.handleOpenRouterCallback(code) // 调用 handleOpenRouterCallback 处理 code
			}
			break // 结束此 case
		}
		default: // 默认情况
			break // 什么也不做
	}
}
