import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"

/**
 * 将 Anthropic 消息转换为 OpenAI 消息格式。
 *
 * @param anthropicMessages - Anthropic 消息数组。
 * @returns 转换后的 OpenAI 消息数组。
 */
export function convertToOpenAiMessages(
	anthropicMessages: Anthropic.Messages.MessageParam[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
	const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = []

	for (const anthropicMessage of anthropicMessages) {
		if (typeof anthropicMessage.content === "string") {
			openAiMessages.push({ role: anthropicMessage.role, content: anthropicMessage.content })
		} else {
			// image_url.url 是 base64 编码的图像数据
			// 确保它包含图像的内容类型: data:image/png;base64,
			/*
        { role: "user", content: "" | { type: "text", text: string } | { type: "image_url", image_url: { url: string } } },
         // content 是必需的，除非存在 tool_calls
        { role: "assistant", content?: "" | null, tool_calls?: [{ id: "", function: { name: "", arguments: "" }, type: "function" }] },
        { role: "tool", tool_call_id: "", content: ""}
         */
			if (anthropicMessage.role === "user") {
				const { nonToolMessages, toolMessages } = anthropicMessage.content.reduce<{
					nonToolMessages: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[]
					toolMessages: Anthropic.ToolResultBlockParam[]
				}>(
					(acc, part) => {
						if (part.type === "tool_result") {
							acc.toolMessages.push(part)
						} else if (part.type === "text" || part.type === "image") {
							acc.nonToolMessages.push(part)
						} // 用户不能发送 tool_use 消息
						return acc
					},
					{ nonToolMessages: [], toolMessages: [] },
				)

				// 首先处理工具结果消息，因为它们必须跟随工具使用消息
				let toolResultImages: Anthropic.Messages.ImageBlockParam[] = []
				toolMessages.forEach((toolMessage) => {
					// Anthropic SDK 允许工具结果是字符串或文本和图像块的数组，支持丰富和结构化的内容。相反，OpenAI SDK 仅支持工具结果作为单个字符串，因此我们将 Anthropic 工具结果部分映射为一个连接的字符串以保持兼容性。
					let content: string

					if (typeof toolMessage.content === "string") {
						content = toolMessage.content
					} else {
						content =
							toolMessage.content
								?.map((part) => {
									if (part.type === "image") {
										toolResultImages.push(part)
										return "(请参见后续用户消息中的图像)"
									}
									return part.text
								})
								.join("\n") ?? ""
					}
					openAiMessages.push({
						role: "tool",
						tool_call_id: toolMessage.tool_use_id,
						content: content,
					})
				})

				// 如果工具结果包含图像，则作为单独的用户消息发送
				// 我遇到了一个问题，如果我对多个工具使用中的一个提供反馈，请求将失败。
				// "紧随 `tool_use` 块的消息必须以相同数量的 `tool_result` 块开头。"
				// 因此，我们需要在工具结果消息之后发送这些图像
				// 注意：实际上可以连续发送多个用户消息，模型会将它们视为同一输入的延续（这种方式比将它们合并为一条消息效果更好，因为工具结果特别提到（请参见后续用户消息中的图像）
				// 更新 v2.0：我们不再使用工具，但如果使用，重要的是要注意 openrouter 提示缓存机制需要一次一个用户消息，因此我们需要将这些图像添加到用户内容数组中。
				// if (toolResultImages.length > 0) {
				// 	openAiMessages.push({
				// 		role: "user",
				// 		content: toolResultImages.map((part) => ({
				// 			type: "image_url",
				// 			image_url: { url: `data:${part.source.media_type};base64,${part.source.data}` },
				// 		})),
				// 	})
				// }

				// 处理非工具消息
				if (nonToolMessages.length > 0) {
					openAiMessages.push({
						role: "user",
						content: nonToolMessages.map((part) => {
							if (part.type === "image") {
								return {
									type: "image_url",
									image_url: { url: `data:${part.source.media_type};base64,${part.source.data}` },
								}
							}
							return { type: "text", text: part.text }
						}),
					})
				}
			} else if (anthropicMessage.role === "assistant") {
				const { nonToolMessages, toolMessages } = anthropicMessage.content.reduce<{
					nonToolMessages: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[]
					toolMessages: Anthropic.ToolUseBlockParam[]
				}>(
					(acc, part) => {
						if (part.type === "tool_use") {
							acc.toolMessages.push(part)
						} else if (part.type === "text" || part.type === "image") {
							acc.nonToolMessages.push(part)
						} // 助手不能发送 tool_result 消息
						return acc
					},
					{ nonToolMessages: [], toolMessages: [] },
				)

				// 处理非工具消息
				let content: string | undefined
				if (nonToolMessages.length > 0) {
					content = nonToolMessages
						.map((part) => {
							if (part.type === "image") {
								return "" // 不可能，因为助手不能发送图像
							}
							return part.text
						})
						.join("\n")
				}

				// 处理工具使用消息
				let tool_calls: OpenAI.Chat.ChatCompletionMessageToolCall[] = toolMessages.map((toolMessage) => ({
					id: toolMessage.id,
					type: "function",
					function: {
						name: toolMessage.name,
						// json 字符串
						arguments: JSON.stringify(toolMessage.input),
					},
				}))

				openAiMessages.push({
					role: "assistant",
					content,
					// 不能是空数组。API 期望数组的最小长度为 1，如果为空将返回错误
					tool_calls: tool_calls.length > 0 ? tool_calls : undefined,
				})
			}
		}
	}

	return openAiMessages
}

/**
 * 将 OpenAI 响应转换为 Anthropic 格式。
 *
 * @param completion - OpenAI 聊天完成对象。
 * @returns 转换后的 Anthropic 消息。
 */
export function convertToAnthropicMessage(
	completion: OpenAI.Chat.Completions.ChatCompletion,
): Anthropic.Messages.Message {
	const openAiMessage = completion.choices[0].message
	const anthropicMessage: Anthropic.Messages.Message = {
		id: completion.id,
		type: "message",
		role: openAiMessage.role, // 始终为 "assistant"
		content: [
			{
				type: "text",
				text: openAiMessage.content || "",
			},
		],
		model: completion.model,
		stop_reason: (() => {
			switch (completion.choices[0].finish_reason) {
				case "stop":
					return "end_turn"
				case "length":
					return "max_tokens"
				case "tool_calls":
					return "tool_use"
				case "content_filter": // Anthropic 没有完全对应的选项
				default:
					return null
			}
		})(),
		stop_sequence: null, // 生成的自定义停止序列（如果有）（如果不使用停止序列则不适用）
		usage: {
			input_tokens: completion.usage?.prompt_tokens || 0,
			output_tokens: completion.usage?.completion_tokens || 0,
		},
	}

	if (openAiMessage.tool_calls && openAiMessage.tool_calls.length > 0) {
		anthropicMessage.content.push(
			...openAiMessage.tool_calls.map((toolCall): Anthropic.ToolUseBlock => {
				let parsedInput = {}
				try {
					parsedInput = JSON.parse(toolCall.function.arguments || "{}")
				} catch (error) {
					console.error("解析工具参数失败:", error)
				}
				return {
					type: "tool_use",
					id: toolCall.id,
					name: toolCall.function.name,
					input: parsedInput,
				}
			}),
		)
	}
	return anthropicMessage
}
