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
		label: "增强 Prompt",
		description:
			"使用即时增强功能为您的输入提供量身定制的建议或改进。这可以确保Roo理解您的意图，并提供最佳的响应。可通过 ✨ 图标在聊天中使用。",
		template: `Generate an enhanced version of this prompt (reply with only the enhanced prompt - no conversation, explanations, lead-in, bullet points, placeholders, or surrounding quotes):

\${userInput}`,
	},
	EXPLAIN: {
		label: "解释代码",
		description:
			"获取代码片段、函数或整个文件的详细解释。有助于理解复杂代码或学习新模式。在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击所选代码）中可用。",
		template: `Explain the following code from file path @/\${filePath}:
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

Please provide a clear and concise explanation of what this code does, including:
1. The purpose and functionality
2. Key components and their interactions
3. Important patterns or techniques used`,
	},
	FIX: {
		label: "Fix Issues(解决问题)",
		description:
			"获取识别和解决bug、错误或代码质量问题的帮助。提供解决问题的分步指导。在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击所选代码）中可用。",
		template: `Fix any issues in the following code from file path @/\${filePath}
\${diagnosticText}
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

Please:
1. Address all detected problems listed above (if any)
2. Identify any other potential bugs or issues
3. Provide corrected code
4. Explain what was fixed and why`,
	},
	IMPROVE: {
		label: "Improve Code(改进代码)",
		description:
			"在维护功能的同时，接收代码优化、更好实践和架构改进的建议。在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击所选代码）中可用。",
		template: `Improve the following code from file path @/\${filePath}:
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

Please suggest improvements for:
1. Code readability and maintainability
2. Performance optimization
3. Best practices and patterns
4. Error handling and edge cases

Provide the improved code along with explanations for each enhancement.`,
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
Terminal output:
\`\`\`
\${terminalContent}
\`\`\``,
	},
	TERMINAL_FIX: {
		label: "Fix Terminal Command",
		description:
			"获取帮助，修复失败或需要改进的终端命令。在终端上下文菜单中可用（右键单击选定的终端内容）。",
		template: `\${userInput}
Fix this terminal command:
\`\`\`
\${terminalContent}
\`\`\`

Please:
1. Identify any issues in the command
2. Provide the corrected command
3. Explain what was fixed and why`,
	},
	TERMINAL_EXPLAIN: {
		label: "Explain Terminal Command",
		description:
			"获取终端命令及其输出的详细说明。在终端上下文菜单中可用（右键单击选定的终端内容）。",
		template: `\${userInput}
Explain this terminal command:
\`\`\`
\${terminalContent}
\`\`\`

Please provide:
1. What the command does
2. Explanation of each part/flag
3. Expected output and behavior`,
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
