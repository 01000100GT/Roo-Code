import { Anthropic } from "@anthropic-ai/sdk" // 从 "@anthropic-ai/sdk" 导入 Anthropic
import { GlamaHandler } from "./providers/glama" // 从 "./providers/glama" 导入 GlamaHandler
import { ApiConfiguration, ModelInfo } from "../shared/api" // 从 "../shared/api" 导入 ApiConfiguration 和 ModelInfo
import { AnthropicHandler } from "./providers/anthropic" // 从 "./providers/anthropic" 导入 AnthropicHandler
import { AwsBedrockHandler } from "./providers/bedrock" // 从 "./providers/bedrock" 导入 AwsBedrockHandler
import { OpenRouterHandler } from "./providers/openrouter" // 从 "./providers/openrouter" 导入 OpenRouterHandler
import { VertexHandler } from "./providers/vertex" // 从 "./providers/vertex" 导入 VertexHandler
import { OpenAiHandler } from "./providers/openai" // 从 "./providers/openai" 导入 OpenAiHandler
import { OllamaHandler } from "./providers/ollama" // 从 "./providers/ollama" 导入 OllamaHandler
import { LmStudioHandler } from "./providers/lmstudio" // 从 "./providers/lmstudio" 导入 LmStudioHandler
import { GeminiHandler } from "./providers/gemini" // 从 "./providers/gemini" 导入 GeminiHandler
import { OpenAiNativeHandler } from "./providers/openai-native" // 从 "./providers/openai-native" 导入 OpenAiNativeHandler
import { DeepSeekHandler } from "./providers/deepseek" // 从 "./providers/deepseek" 导入 DeepSeekHandler
import { MistralHandler } from "./providers/mistral" // 从 "./providers/mistral" 导入 MistralHandler
import { VsCodeLmHandler } from "./providers/vscode-lm" // 从 "./providers/vscode-lm" 导入 VsCodeLmHandler
import { ApiStream } from "./transform/stream" // 从 "./transform/stream" 导入 ApiStream
import { UnboundHandler } from "./providers/unbound" // 从 "./providers/unbound" 导入 UnboundHandler
import { RequestyHandler } from "./providers/requesty" // 从 "./providers/requesty" 导入 RequestyHandler

export interface SingleCompletionHandler {
	// 定义 SingleCompletionHandler 接口
	completePrompt(prompt: string): Promise<string> // 定义 completePrompt 方法，接收一个字符串参数并返回一个 Promise
}

export interface ApiHandler {
	// 定义 ApiHandler 接口
	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream // 定义 createMessage 方法，接收两个参数并返回 ApiStream
	getModel(): { id: string; info: ModelInfo } // 定义 getModel 方法，返回一个包含 id 和 info 的对象
}

export function buildApiHandler(configuration: ApiConfiguration): ApiHandler {
	// 定义 buildApiHandler 函数，接收 ApiConfiguration 类型的参数并返回 ApiHandler
	const { apiProvider, ...options } = configuration // 解构 configuration，获取 apiProvider 和其他选项
	switch (
		apiProvider // 根据 apiProvider 的值选择不同的处理器
	) {
		case "anthropic":
			return new AnthropicHandler(options) // 如果是 "anthropic"，返回 AnthropicHandler 实例
		case "glama":
			return new GlamaHandler(options) // 如果是 "glama"，返回 GlamaHandler 实例
		case "openrouter":
			return new OpenRouterHandler(options) // 如果是 "openrouter"，返回 OpenRouterHandler 实例
		case "bedrock":
			return new AwsBedrockHandler(options) // 如果是 "bedrock"，返回 AwsBedrockHandler 实例
		case "vertex":
			return new VertexHandler(options) // 如果是 "vertex"，返回 VertexHandler 实例
		case "openai":
			return new OpenAiHandler(options) // 如果是 "openai"，返回 OpenAiHandler 实例
		case "ollama":
			return new OllamaHandler(options) // 如果是 "ollama"，返回 OllamaHandler 实例
		case "lmstudio":
			return new LmStudioHandler(options) // 如果是 "lmstudio"，返回 LmStudioHandler 实例
		case "gemini":
			return new GeminiHandler(options) // 如果是 "gemini"，返回 GeminiHandler 实例
		case "openai-native":
			return new OpenAiNativeHandler(options) // 如果是 "openai-native"，返回 OpenAiNativeHandler 实例
		case "deepseek":
			return new DeepSeekHandler(options) // 如果是 "deepseek"，返回 DeepSeekHandler 实例
		case "vscode-lm":
			return new VsCodeLmHandler(options) // 如果是 "vscode-lm"，返回 VsCodeLmHandler 实例
		case "mistral":
			return new MistralHandler(options) // 如果是 "mistral"，返回 MistralHandler 实例
		case "unbound":
			return new UnboundHandler(options) // 如果是 "unbound"，返回 UnboundHandler 实例
		case "requesty":
			return new RequestyHandler(options) // 如果是 "requesty"，返回 RequestyHandler 实例
		default:
			return new AnthropicHandler(options) // 默认返回 AnthropicHandler 实例
	}
}
