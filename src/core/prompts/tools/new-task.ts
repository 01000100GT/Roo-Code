import { ToolArgs } from "./types"

export function getNewTaskDescription(args: ToolArgs): string {
	return `## new_task
描述: 创建一个具有指定启动模式和初始消息的新任务。此工具指示系统在给定模式下使用提供的消息创建一个新的Cline实例。

参数:
- mode: (必需) 启动新任务的模式的标识符 (例如, "code", "ask", "architect")。
- message: (必需) 此新任务的初始用户消息或指令。

用法:
<new_task>
<mode>your-mode-slug-here</mode>
<message>Your initial instructions here</message>
</new_task>

示例:
<new_task>
<mode>code</mode>
<message>Implement a new feature for the application.</message>
</new_task>
`
}
