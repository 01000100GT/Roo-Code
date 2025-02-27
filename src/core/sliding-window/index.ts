import { Anthropic } from "@anthropic-ai/sdk"

import { ModelInfo } from "../../shared/api"

/**
 * 通过移除一部分消息来截断对话。
 *
 * 第一条消息始终保留，并且从开始处（不包括第一条消息）移除指定比例（向下取整为偶数）
 * 的消息。
 *
 * @param {Anthropic.Messages.MessageParam[]} messages - 对话消息数组
 * @param {number} fracToRemove - 要移除的消息比例（介于0和1之间，不包括第一条消息）
 * @returns {Anthropic.Messages.MessageParam[]} 截断后的对话消息数组
 */
export function truncateConversation(
	messages: Anthropic.Messages.MessageParam[],
	fracToRemove: number,
): Anthropic.Messages.MessageParam[] {
	const truncatedMessages = [messages[0]]
	const rawMessagesToRemove = Math.floor((messages.length - 1) * fracToRemove)
	const messagesToRemove = rawMessagesToRemove - (rawMessagesToRemove % 2)
	const remainingMessages = messages.slice(messagesToRemove + 1)
	truncatedMessages.push(...remainingMessages)

	return truncatedMessages
}

/**
 * 当总token数超过模型限制时，有条件地截断对话消息。
 *
 * 根据模型是否支持提示缓存，使用不同的最大token阈值和截断比例。
 * 如果当前总token数超过阈值，则使用适当的比例截断对话。
 *
 * @param {Anthropic.Messages.MessageParam[]} messages - 对话消息数组
 * @param {number} totalTokens - 对话中的总token数
 * @param {ModelInfo} modelInfo - 包含上下文窗口大小和提示缓存支持的模型元数据
 * @returns {Anthropic.Messages.MessageParam[]} 原始或截断后的对话消息数组
 */
export function truncateConversationIfNeeded(
	messages: Anthropic.Messages.MessageParam[],
	totalTokens: number,
	modelInfo: ModelInfo,
): Anthropic.Messages.MessageParam[] {
	if (modelInfo.supportsPromptCache) {
		return totalTokens < getMaxTokensForPromptCachingModels(modelInfo)
			? messages
			: truncateConversation(messages, getTruncFractionForPromptCachingModels(modelInfo))
	} else {
		return totalTokens < getMaxTokensForNonPromptCachingModels(modelInfo)
			? messages
			: truncateConversation(messages, getTruncFractionForNonPromptCachingModels(modelInfo))
	}
}

/**
 * 计算支持提示缓存的模型允许的最大token数。
 *
 * 最大值计算为(上下文窗口大小 - 缓冲区)和上下文窗口大小的80%中的较大值。
 *
 * @param {ModelInfo} modelInfo - 包含上下文窗口大小的模型信息
 * @returns {number} 支持提示缓存模型允许的最大token数
 */
function getMaxTokensForPromptCachingModels(modelInfo: ModelInfo): number {
	// 缓冲区需要至少与 modelInfo.maxTokens 一样大
	const buffer = modelInfo.maxTokens ? Math.max(40_000, modelInfo.maxTokens) : 40_000
	return Math.max(modelInfo.contextWindow - buffer, modelInfo.contextWindow * 0.8)
}

/**
 * 提供支持提示缓存的模型需要移除的消息比例。
 *
 * @param {ModelInfo} modelInfo - 模型信息（在当前实现中未使用）
 * @returns {number} 支持提示缓存模型的截断比例（固定为0.5）
 */
function getTruncFractionForPromptCachingModels(modelInfo: ModelInfo): number {
	return 0.5
}

/**
 * 计算不支持提示缓存的模型允许的最大token数。
 *
 * 最大值计算为(上下文窗口大小 - 40000)和上下文窗口大小的80%中的较大值。
 *
 * @param {ModelInfo} modelInfo - 包含上下文窗口大小的模型信息
 * @returns {number} 不支持提示缓存模型允许的最大token数
 */
function getMaxTokensForNonPromptCachingModels(modelInfo: ModelInfo): number {
	// 缓冲区需要至少与 modelInfo.maxTokens 一样大
	const buffer = modelInfo.maxTokens ? Math.max(40_000, modelInfo.maxTokens) : 40_000
	return Math.max(modelInfo.contextWindow - buffer, modelInfo.contextWindow * 0.8)
}

/**
 * 提供不支持提示缓存的模型需要移除的消息比例。
 *
 * @param {ModelInfo} modelInfo - 模型信息
 * @returns {number} 不支持提示缓存模型的截断比例（固定为0.1）
 */
function getTruncFractionForNonPromptCachingModels(modelInfo: ModelInfo): number {
	return Math.min(40_000 / modelInfo.contextWindow, 0.2)
}
