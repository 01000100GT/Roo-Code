import { Anthropic } from "@anthropic-ai/sdk"
import { Mistral } from "@mistralai/mistralai"
import { AssistantMessage } from "@mistralai/mistralai/models/components/assistantmessage"
import { SystemMessage } from "@mistralai/mistralai/models/components/systemmessage"
import { ToolMessage } from "@mistralai/mistralai/models/components/toolmessage"
import { UserMessage } from "@mistralai/mistralai/models/components/usermessage"

/**
 * 定义 MistralMessage 类型。
 * 包含四种角色：system、user、assistant 和 tool。
 */
export type MistralMessage =
	| (SystemMessage & { role: "system" })
	| (UserMessage & { role: "user" })
	| (AssistantMessage & { role: "assistant" })
	| (ToolMessage & { role: "tool" })

/**
 * 将 Anthropic 消息转换为 Mistral 消息。
 *
 * @param anthropicMessages - Anthropic 消息数组。
 * @returns 转换后的 Mistral 消息数组。
 */
export function convertToMistralMessages(anthropicMessages: Anthropic.Messages.MessageParam[]): MistralMessage[] {
	// 初始化 Mistral 消息数组
	const mistralMessages: MistralMessage[] = []
	// 遍历每个 Anthropic 消息
	for (const anthropicMessage of anthropicMessages) {
		// 如果消息内容是字符串
		if (typeof anthropicMessage.content === "string") {
			// 直接添加到 Mistral 消息数组
			mistralMessages.push({
				role: anthropicMessage.role,
				content: anthropicMessage.content,
			})
		} else {
			// 如果消息角色是用户
			if (anthropicMessage.role === "user") {
				// 将消息内容分为非工具消息和工具消息
				const { nonToolMessages, toolMessages } = anthropicMessage.content.reduce<{
					nonToolMessages: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[]
					toolMessages: Anthropic.ToolResultBlockParam[]
				}>(
					(acc, part) => {
						// 如果是工具结果类型，添加到工具消息
						if (part.type === "tool_result") {
							acc.toolMessages.push(part)
						} else if (part.type === "text" || part.type === "image") {
							// 如果是文本或图片类型，添加到非工具消息
							acc.nonToolMessages.push(part)
						} // 用户不能发送工具使用消息
						return acc
					},
					{ nonToolMessages: [], toolMessages: [] },
				)

				// 如果有非工具消息
				if (nonToolMessages.length > 0) {
					// 将非工具消息转换并添加到 Mistral 消息数组
					mistralMessages.push({
						role: "user",
						content: nonToolMessages.map((part) => {
							if (part.type === "image") {
								return {
									type: "image_url",
									imageUrl: {
										url: `data:${part.source.media_type};base64,${part.source.data}`,
									},
								}
							}
							return { type: "text", text: part.text }
						}),
					})
				}
			} else if (anthropicMessage.role === "assistant") {
				// 将消息内容分为非工具消息和工具使用消息
				const { nonToolMessages, toolMessages } = anthropicMessage.content.reduce<{
					nonToolMessages: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[]
					toolMessages: Anthropic.ToolUseBlockParam[]
				}>(
					(acc, part) => {
						// 如果是工具使用类型，添加到工具消息
						if (part.type === "tool_use") {
							acc.toolMessages.push(part)
						} else if (part.type === "text" || part.type === "image") {
							// 如果是文本或图片类型，添加到非工具消息
							acc.nonToolMessages.push(part)
						} // 助手不能发送工具结果消息
						return acc
					},
					{ nonToolMessages: [], toolMessages: [] },
				)

				let content: string | undefined
				// 如果有非工具消息
				if (nonToolMessages.length > 0) {
					// 将非工具消息内容拼接成字符串
					content = nonToolMessages
						.map((part) => {
							if (part.type === "image") {
								return "" // 不可能，因为助手不能发送图片
							}
							return part.text
						})
						.join("\n")
				}

				// 添加助手消息到 Mistral 消息数组
				mistralMessages.push({
					role: "assistant",
					content,
				})
			}
		}
	}

	// 返回转换后的 Mistral 消息数组
	return mistralMessages
}
