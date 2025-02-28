import { Anthropic } from "@anthropic-ai/sdk"
import * as path from "path"
import * as diff from "diff"

export const formatResponse = {
	toolDenied: () => `The user denied this operation.`,

	toolDeniedWithFeedback: (feedback?: string) =>
		`用户拒绝了此操作并提供了以下反馈:\n<feedback>\n${feedback}\n</feedback>`,

	toolApprovedWithFeedback: (feedback?: string) =>
		`用户批准了此操作并提供了以下上下文:\n<feedback>\n${feedback}\n</feedback>`,

	toolError: (error?: string) => `工具执行失败，错误信息如下:\n<error>\n${error}\n</error>`,

	noToolsUsed: () =>
		`[ERROR] 您在之前的回复中没有使用工具！请重试并使用工具。

${toolUseInstructionsReminder}

# 下一步

如果您已完成用户的任务，请使用attempt_completion工具。
如果您需要用户提供更多信息，请使用ask_followup_question工具。
否则，如果您尚未完成任务且不需要额外信息，请继续执行任务的下一步。
（这是一条自动消息，请不要以对话方式回复。）`,

	tooManyMistakes: (feedback?: string) =>
		`您似乎在继续操作时遇到了困难。用户提供了以下反馈以帮助指导您:\n<feedback>\n${feedback}\n</feedback>`,

	missingToolParameterError: (paramName: string) =>
		`缺少必需参数'${paramName}'的值。请重试并提供完整的响应。\n\n${toolUseInstructionsReminder}`,

	invalidMcpToolArgumentError: (serverName: string, toolName: string) =>
		`使用了无效的JSON参数与${serverName}用于${toolName}。请重试并使用正确格式的JSON参数。`,

	toolResult: (
		text: string,
		images?: string[],
	): string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> => {
		if (images && images.length > 0) {
			const textBlock: Anthropic.TextBlockParam = { type: "text", text }
			const imageBlocks: Anthropic.ImageBlockParam[] = formatImagesIntoBlocks(images)
			// Placing images after text leads to better results
			return [textBlock, ...imageBlocks]
		} else {
			return text
		}
	},

	imageBlocks: (images?: string[]): Anthropic.ImageBlockParam[] => {
		return formatImagesIntoBlocks(images)
	},

	formatFilesList: (absolutePath: string, files: string[], didHitLimit: boolean): string => {
		const sorted = files
			.map((file) => {
				// convert absolute path to relative path
				const relativePath = path.relative(absolutePath, file).toPosix()
				return file.endsWith("/") ? relativePath + "/" : relativePath
			})
			// Sort so files are listed under their respective directories to make it clear what files are children of what directories. Since we build file list top down, even if file list is truncated it will show directories that cline can then explore further.
			.sort((a, b) => {
				const aParts = a.split("/") // only works if we use toPosix first
				const bParts = b.split("/")
				for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
					if (aParts[i] !== bParts[i]) {
						// If one is a directory and the other isn't at this level, sort the directory first
						if (i + 1 === aParts.length && i + 1 < bParts.length) {
							return -1
						}
						if (i + 1 === bParts.length && i + 1 < aParts.length) {
							return 1
						}
						// Otherwise, sort alphabetically
						return aParts[i].localeCompare(bParts[i], undefined, { numeric: true, sensitivity: "base" })
					}
				}
				// If all parts are the same up to the length of the shorter path,
				// the shorter one comes first
				return aParts.length - bParts.length
			})
		if (didHitLimit) {
			return `${sorted.join("\n")}\n\n(文件列表已截断。如需进一步探索，请在特定子目录上使用list_files。)`
		} else if (sorted.length === 0 || (sorted.length === 1 && sorted[0] === "")) {
			return "No files found."
		} else {
			return sorted.join("\n")
		}
	},

	createPrettyPatch: (filename = "file", oldStr?: string, newStr?: string) => {
		// strings cannot be undefined or diff throws exception
		const patch = diff.createPatch(filename.toPosix(), oldStr || "", newStr || "")
		const lines = patch.split("\n")
		const prettyPatchLines = lines.slice(4)
		return prettyPatchLines.join("\n")
	},
}

// to avoid circular dependency
const formatImagesIntoBlocks = (images?: string[]): Anthropic.ImageBlockParam[] => {
	return images
		? images.map((dataUrl) => {
				// data:image/png;base64,base64string
				const [rest, base64] = dataUrl.split(",")
				const mimeType = rest.split(":")[1].split(";")[0]
				return {
					type: "image",
					source: { type: "base64", media_type: mimeType, data: base64 },
				} as Anthropic.ImageBlockParam
			})
		: []
}

const toolUseInstructionsReminder = `# 提醒: 工具使用说明

工具使用采用XML风格的标签格式。工具名称用开始和结束标签括起来，每个参数也用自己的一组标签括起来。结构如下:

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

例如:

<attempt_completion>
<result>
I have completed the task...
</result>
</attempt_completion>

始终遵循此格式进行所有工具使用，以确保正确解析和执行。`
