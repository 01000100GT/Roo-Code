import { Anthropic } from "@anthropic-ai/sdk"
import { MessageContent } from "../../shared/api"
import { ConversationRole, Message, ContentBlock } from "@aws-sdk/client-bedrock-runtime"

// 从 bedrock.ts 导入 StreamEvent 类型
import { StreamEvent } from "../providers/bedrock"

/**
 * 将 Anthropic 消息转换为 Bedrock Converse 格式
 */
export function convertToBedrockConverseMessages(anthropicMessages: Anthropic.Messages.MessageParam[]): Message[] {
	return anthropicMessages.map((anthropicMessage) => {
		// 将 Anthropic 角色映射到 Bedrock 角色
		const role: ConversationRole = anthropicMessage.role === "assistant" ? "assistant" : "user"

		if (typeof anthropicMessage.content === "string") {
			return {
				role,
				content: [
					{
						text: anthropicMessage.content,
					},
				] as ContentBlock[],
			}
		}

		// 处理复杂内容类型
		const content = anthropicMessage.content.map((block) => {
			const messageBlock = block as MessageContent & {
				id?: string
				tool_use_id?: string
				content?: Array<{ type: string; text: string }>
				output?: string | Array<{ type: string; text: string }>
			}

			if (messageBlock.type === "text") {
				return {
					text: messageBlock.text || "",
				} as ContentBlock
			}

			if (messageBlock.type === "image" && messageBlock.source) {
				// 如果需要，将 base64 字符串转换为字节数组
				let byteArray: Uint8Array
				if (typeof messageBlock.source.data === "string") {
					const binaryString = atob(messageBlock.source.data)
					byteArray = new Uint8Array(binaryString.length)
					for (let i = 0; i < binaryString.length; i++) {
						byteArray[i] = binaryString.charCodeAt(i)
					}
				} else {
					byteArray = messageBlock.source.data
				}

				// 从 media_type 中提取格式（例如，"image/jpeg" -> "jpeg"）
				const format = messageBlock.source.media_type.split("/")[1]
				if (!["png", "jpeg", "gif", "webp"].includes(format)) {
					throw new Error(`不支持的图像格式: ${format}`)
				}

				return {
					image: {
						format: format as "png" | "jpeg" | "gif" | "webp",
						source: {
							bytes: byteArray,
						},
					},
				} as ContentBlock
			}

			if (messageBlock.type === "tool_use") {
				// 将工具使用转换为 XML 格式
				const toolParams = Object.entries(messageBlock.input || {})
					.map(([key, value]) => `<${key}>\n${value}\n</${key}>`)
					.join("\n")

				return {
					toolUse: {
						toolUseId: messageBlock.id || "",
						name: messageBlock.name || "",
						input: `<${messageBlock.name}>\n${toolParams}\n</${messageBlock.name}>`,
					},
				} as ContentBlock
			}

			if (messageBlock.type === "tool_result") {
				// 首先尝试使用内容（如果可用）
				if (messageBlock.content && Array.isArray(messageBlock.content)) {
					return {
						toolResult: {
							toolUseId: messageBlock.tool_use_id || "",
							content: messageBlock.content.map((item) => ({
								text: item.text,
							})),
							status: "success",
						},
					} as ContentBlock
				}

				// 如果内容不可用，则回退到输出处理
				if (messageBlock.output && typeof messageBlock.output === "string") {
					return {
						toolResult: {
							toolUseId: messageBlock.tool_use_id || "",
							content: [
								{
									text: messageBlock.output,
								},
							],
							status: "success",
						},
					} as ContentBlock
				}
				// 如果输出是数组，则处理内容块数组
				if (Array.isArray(messageBlock.output)) {
					return {
						toolResult: {
							toolUseId: messageBlock.tool_use_id || "",
							content: messageBlock.output.map((part) => {
								if (typeof part === "object" && "text" in part) {
									return { text: part.text }
								}
								// 跳过工具结果中的图像，因为它们是单独处理的
								if (typeof part === "object" && "type" in part && part.type === "image") {
									return { text: "(请参阅后续消息中的图像)" }
								}
								return { text: String(part) }
							}),
							status: "success",
						},
					} as ContentBlock
				}

				// 默认情况
				return {
					toolResult: {
						toolUseId: messageBlock.tool_use_id || "",
						content: [
							{
								text: String(messageBlock.output || ""),
							},
						],
						status: "success",
					},
				} as ContentBlock
			}

			if (messageBlock.type === "video") {
				const videoContent = messageBlock.s3Location
					? {
							s3Location: {
								uri: messageBlock.s3Location.uri,
								bucketOwner: messageBlock.s3Location.bucketOwner,
							},
						}
					: messageBlock.source

				return {
					video: {
						format: "mp4", // 默认使用 mp4，根据实际格式进行调整（如果需要）
						source: videoContent,
					},
				} as ContentBlock
			}

			// 未知块类型的默认情况
			return {
				text: "[未知块类型]",
			} as ContentBlock
		})

		return {
			role,
			content,
		}
	})
}

/**
 * 将 Bedrock Converse 流事件转换为 Anthropic 消息格式
 */
export function convertToAnthropicMessage(
	streamEvent: StreamEvent,
	modelId: string,
): Partial<Anthropic.Messages.Message> {
	// 处理元数据事件
	if (streamEvent.metadata?.usage) {
		return {
			id: "", // Bedrock 不提供消息 ID
			type: "message",
			role: "assistant",
			model: modelId,
			usage: {
				input_tokens: streamEvent.metadata.usage.inputTokens || 0,
				output_tokens: streamEvent.metadata.usage.outputTokens || 0,
			},
		}
	}

	// 处理内容块
	const text = streamEvent.contentBlockStart?.start?.text || streamEvent.contentBlockDelta?.delta?.text
	if (text !== undefined) {
		return {
			type: "message",
			role: "assistant",
			content: [{ type: "text", text: text }],
			model: modelId,
		}
	}

	// 处理消息停止
	if (streamEvent.messageStop) {
		return {
			type: "message",
			role: "assistant",
			stop_reason: streamEvent.messageStop.stopReason || null,
			stop_sequence: null,
			model: modelId,
		}
	}

	return {}
}
