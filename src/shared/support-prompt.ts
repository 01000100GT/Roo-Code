// Support prompts
type PromptParams = Record<string, string | any[]>

const generateDiagnosticText = (diagnostics?: any[]) => {
	if (!diagnostics?.length) return ""
	return `\nCurrent problems detected:\n${diagnostics
		.map((d) => `- [${d.source || "Error"}] ${d.message}${d.code ? ` (${d.code})` : ""}`)
		.join("\n")}`
}

export const createPrompt = (template: string, params: PromptParams): string => {
	let result = template
	for (const [key, value] of Object.entries(params)) {
		if (key === "diagnostics") {
			result = result.replaceAll("${diagnosticText}", generateDiagnosticText(value as any[]))
		} else {
			result = result.replaceAll(`\${${key}}`, value as string)
		}
	}

	// Replace any remaining placeholders with empty strings
	result = result.replaceAll(/\${[^}]*}/g, "")

	return result
}

interface SupportPromptConfig {
	label: string
	description: string
	template: string
}

const supportPromptConfigs: Record<string, SupportPromptConfig> = {
	ENHANCE: {
		label: "Enhance Prompt",
		description:
			"使用即时增强功能为您的输入提供量身定制的建议或改进。这可以确保Roo理解您的意图，并提供最佳的响应。可通过 ✨ 图标在聊天中使用。",
		template: `生成此提示的增强版本（仅使用增强的提示进行回复-没有对话、解释、引言、要点、占位符或周围的引号）：

\${userInput}`,
	},
	EXPLAIN: {
		label: "Explain Code",
		description:
			"获取代码片段、函数或整个文件的详细解释。有助于理解复杂代码或学习新模式。在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击所选代码）中可用。",
		template: `解释文件路径中的以下代码 @/\${filePath}:
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

请清晰简洁地解释此代码的作用，包括：
1.目的和功能
2.关键组成部分及其相互作用
3.使用的重要图案或技术`,
	},
	FIX: {
		label: "Fix Issues",
		description:
			"获取识别和解决bug、错误或代码质量问题的帮助。提供解决问题的分步指导。在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击所选代码）中可用。",
		template: `从文件路径修复以下代码中的任何问题 @/\${filePath}
\${diagnosticText}
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

请:
1.解决上面列出的所有检测到的问题（如果有的话）
2.识别任何其他潜在的错误或问题
3.提供正确的代码
4.解释已修复的内容及其原因`,
	},
	IMPROVE: {
		label: "Improve Code",
		description:
			"在维护功能的同时，接收代码优化、更好实践和架构改进的建议。在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击所选代码）中可用。",
		template: `从文件路径改进以下代码 @/\${filePath}:
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

请就以下方面提出改进建议：
1.代码可读性和可维护性
2.性能优化
3.最佳做法和模式
4.错误处理和边缘情况

提供改进后的代码以及对每个增强功能的解释。`,
	},
	ADD_TO_CONTEXT: {
		label: "Add to Context",
		description:
			"为当前任务或对话添加上下文。有助于提供额外信息或澄清。在代码操作中可用（编辑器中的灯泡图标）。以及编辑器上下文菜单（右键单击所选代码）。",
		template: `@/\${filePath}:
\`\`\`
\${selectedText}
\`\`\``,
	},
	TERMINAL_ADD_TO_CONTEXT: {
		label: "Add Terminal Content to Context",
		description:
			"将终端输出添加到当前任务或对话中。可用于提供命令输出或日志。在终端上下文菜单中可用（右键单击选定的终端内容）。",
		template: `\${userInput}
终端输出:
\`\`\`
\${terminalContent}
\`\`\``,
	},
	TERMINAL_FIX: {
		label: "Fix Terminal Command",
		description:
			"获取帮助，修复失败或需要改进的终端命令。在终端上下文菜单中可用（右键单击选定的终端内容）。",
		template: `\${userInput}
修复此终端命令：
\`\`\`
\${terminalContent}
\`\`\`

请:
1.识别命令中的任何问题
2.提供正确的命令
3.解释已修复的内容及其原因`,
	},
	TERMINAL_EXPLAIN: {
		label: "Explain Terminal Command",
		description:
			"获取终端命令及其输出的详细说明。在终端上下文菜单中可用（右键单击选定的终端内容）。",
		template: `\${userInput}
解释此终端命令:
\`\`\`
\${terminalContent}
\`\`\`

请提供：
1.命令的作用是什么
2.每个部分/标志的说明
3.预期产出和行为`,
	},
} as const

type SupportPromptType = keyof typeof supportPromptConfigs

export const supportPrompt = {
	default: Object.fromEntries(Object.entries(supportPromptConfigs).map(([key, config]) => [key, config.template])),
	get: (customSupportPrompts: Record<string, any> | undefined, type: SupportPromptType): string => {
		return customSupportPrompts?.[type] ?? supportPromptConfigs[type].template
	},
	create: (type: SupportPromptType, params: PromptParams, customSupportPrompts?: Record<string, any>): string => {
		const template = supportPrompt.get(customSupportPrompts, type)
		return createPrompt(template, params)
	},
} as const

export type { SupportPromptType }

// Expose labels and descriptions for UI
export const supportPromptLabels = Object.fromEntries(
	Object.entries(supportPromptConfigs).map(([key, config]) => [key, config.label]),
) as Record<SupportPromptType, string>

export const supportPromptDescriptions = Object.fromEntries(
	Object.entries(supportPromptConfigs).map(([key, config]) => [key, config.description]),
) as Record<SupportPromptType, string>

export type CustomSupportPrompts = {
	[key: string]: string | undefined
}
