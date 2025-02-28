/**
 * ApiStream 类型定义为异步生成器，生成 ApiStreamChunk。
 */
export type ApiStream = AsyncGenerator<ApiStreamChunk>

/**
 * ApiStreamChunk 类型可以是 ApiStreamTextChunk、ApiStreamUsageChunk 或 ApiStreamReasoningChunk。
 */
export type ApiStreamChunk = ApiStreamTextChunk | ApiStreamUsageChunk | ApiStreamReasoningChunk

/**
 * ApiStreamTextChunk 接口定义文本块。
 *
 * @property type - 类型为 "text"。
 * @property text - 文本内容 (string 类型)。
 */
export interface ApiStreamTextChunk {
	type: "text"
	text: string
}

/**
 * ApiStreamReasoningChunk 接口定义推理块。
 *
 * @property type - 类型为 "reasoning"。
 * @property text - 推理内容 (string 类型)。
 */
export interface ApiStreamReasoningChunk {
	type: "reasoning"
	text: string
}

/**
 * ApiStreamUsageChunk 接口定义使用情况块。
 *
 * @property type - 类型为 "usage"。
 * @property inputTokens - 输入的令牌数量 (number 类型)。
 * @property outputTokens - 输出的令牌数量 (number 类型)。
 * @property cacheWriteTokens - 可选，缓存写入的令牌数量 (number 类型)。
 * @property cacheReadTokens - 可选，缓存读取的令牌数量 (number 类型)。
 * @property totalCost - 可选，总成本 (number 类型)，用于 openrouter。
 */
export interface ApiStreamUsageChunk {
	type: "usage"
	inputTokens: number
	outputTokens: number
	cacheWriteTokens?: number
	cacheReadTokens?: number
	totalCost?: number // openrouter
}
