import { Anthropic } from "@anthropic-ai/sdk"
import {
	Content,
	EnhancedGenerateContentResponse,
	FunctionCallPart,
	FunctionDeclaration,
	FunctionResponsePart,
	InlineDataPart,
	Part,
	SchemaType,
	TextPart,
} from "@google/generative-ai"

/**
 * 将 Anthropic 内容转换为 Gemini 格式。
 *
 * @param content - Anthropic 内容，可以是字符串或内容块数组。
 * @returns 转换后的 Gemini 格式的内容块数组。
 */
export function convertAnthropicContentToGemini(
	content:
		| string
		| Array<
				| Anthropic.Messages.TextBlockParam
				| Anthropic.Messages.ImageBlockParam
				| Anthropic.Messages.ToolUseBlockParam
				| Anthropic.Messages.ToolResultBlockParam
		  >,
): Part[] {
	if (typeof content === "string") {
		// 如果内容是字符串，直接返回文本部分
		return [{ text: content } as TextPart]
	}
	// 处理内容块数组
	return content.flatMap((block) => {
		switch (block.type) {
			case "text":
				// 处理文本块
				return { text: block.text } as TextPart
			case "image":
				// 处理图像块
				if (block.source.type !== "base64") {
					throw new Error("Unsupported image source type")
				}
				return {
					inlineData: {
						data: block.source.data,
						mimeType: block.source.media_type,
					},
				} as InlineDataPart
			case "tool_use":
				// 处理工具使用块
				return {
					functionCall: {
						name: block.name,
						args: block.input,
					},
				} as FunctionCallPart
			case "tool_result":
				// 处理工具结果块
				const name = block.tool_use_id.split("-")[0]
				if (!block.content) {
					return []
				}
				if (typeof block.content === "string") {
					return {
						functionResponse: {
							name,
							response: {
								name,
								content: block.content,
							},
						},
					} as FunctionResponsePart
				} else {
					// 当工具失败时，工具结果可能是数组，提供用户反馈，可能包含图像
					const textParts = block.content.filter((part) => part.type === "text")
					const imageParts = block.content.filter((part) => part.type === "image")
					const text = textParts.length > 0 ? textParts.map((part) => part.text).join("\n\n") : ""
					const imageText = imageParts.length > 0 ? "\n\n(See next part for image)" : ""
					return [
						{
							functionResponse: {
								name,
								response: {
									name,
									content: text + imageText,
								},
							},
						} as FunctionResponsePart,
						...imageParts.map(
							(part) =>
								({
									inlineData: {
										data: part.source.data,
										mimeType: part.source.media_type,
									},
								}) as InlineDataPart,
						),
					]
				}
			default:
				throw new Error(`Unsupported content block type: ${(block as any).type}`)
		}
	})
}

/**
 * 将 Anthropic 消息转换为 Gemini 格式。
 *
 * @param message - Anthropic 消息参数。
 * @returns 转换后的 Gemini 格式内容。
 */
export function convertAnthropicMessageToGemini(message: Anthropic.Messages.MessageParam): Content {
	return {
		role: message.role === "assistant" ? "model" : "user", // 转换角色
		parts: convertAnthropicContentToGemini(message.content), // 转换内容
	}
}

/**
 * 将 Anthropic 工具转换为 Gemini 格式。
 *
 * @param tool - Anthropic 工具。
 * @returns 转换后的 Gemini 格式函数声明。
 */
export function convertAnthropicToolToGemini(tool: Anthropic.Messages.Tool): FunctionDeclaration {
	return {
		name: tool.name,
		description: tool.description || "",
		parameters: {
			type: SchemaType.OBJECT,
			properties: Object.fromEntries(
				Object.entries(tool.input_schema.properties || {}).map(([key, value]) => [
					key,
					{
						type: (value as any).type.toUpperCase(),
						description: (value as any).description || "",
					},
				]),
			),
			required: (tool.input_schema.required as string[]) || [],
		},
	}
}

/*
Gemini 在写入文件内容时似乎喜欢双重转义某些字符：https://discuss.ai.google.dev/t/function-call-string-property-is-double-escaped/37867
*/
/**
 * 取消 Gemini 内容的转义。
 *
 * @param content - 需要取消转义的内容字符串。
 * @returns 取消转义后的字符串。
 */
export function unescapeGeminiContent(content: string) {
	return content
		.replace(/\\n/g, "\n")
		.replace(/\\'/g, "'")
		.replace(/\\"/g, '"')
		.replace(/\\r/g, "\r")
		.replace(/\\t/g, "\t")
}

/**
 * 将 Gemini 响应转换为 Anthropic 格式。
 *
 * @param response - 增强的生成内容响应。
 * @returns 转换后的 Anthropic 消息。
 */
export function convertGeminiResponseToAnthropic(
	response: EnhancedGenerateContentResponse,
): Anthropic.Messages.Message {
	const content: Anthropic.Messages.ContentBlock[] = []

	// 添加主要文本响应
	const text = response.text()
	if (text) {
		content.push({ type: "text", text })
	}

	// 将函数调用添加为工具使用块
	const functionCalls = response.functionCalls()
	if (functionCalls) {
		functionCalls.forEach((call, index) => {
			if ("content" in call.args && typeof call.args.content === "string") {
				call.args.content = unescapeGeminiContent(call.args.content)
			}
			content.push({
				type: "tool_use",
				id: `${call.name}-${index}-${Date.now()}`,
				name: call.name,
				input: call.args,
			})
		})
	}

	// 确定停止原因
	let stop_reason: Anthropic.Messages.Message["stop_reason"] = null
	const finishReason = response.candidates?.[0]?.finishReason
	if (finishReason) {
		switch (finishReason) {
			case "STOP":
				stop_reason = "end_turn"
				break
			case "MAX_TOKENS":
				stop_reason = "max_tokens"
				break
			case "SAFETY":
			case "RECITATION":
			case "OTHER":
				stop_reason = "stop_sequence"
				break
			// 如果需要，添加更多情况
		}
	}

	return {
		id: `msg_${Date.now()}`, // 生成唯一 ID
		type: "message",
		role: "assistant",
		content,
		model: "",
		stop_reason,
		stop_sequence: null, // Gemini 不提供此信息
		usage: {
			input_tokens: response.usageMetadata?.promptTokenCount ?? 0,
			output_tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
		},
	}
}
