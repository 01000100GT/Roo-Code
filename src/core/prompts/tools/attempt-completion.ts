export function getAttemptCompletionDescription(): string {
	return `## attempt_completion
描述: 在每次工具使用后，用户将反馈该工具使用的结果，即是否成功或失败，以及任何失败的原因。一旦你收到工具使用的结果并确认任务已完成，使用此工具向用户展示你的工作结果。你可以选择提供一个CLI命令来展示你的工作结果。如果用户对结果不满意，他们可能会反馈，你可以利用这些反馈进行改进并再次尝试。
重要提示: 在你确认用户之前的工具使用成功之前，不能使用此工具。未能这样做将导致代码损坏和系统故障。在使用此工具之前，你必须在<thinking></thinking>标签中问自己是否已确认用户之前的工具使用成功。如果没有，则不要使用此工具。
参数:
- result: (必需) 任务的结果。将此结果制定为最终形式，不需要用户进一步输入。不要以问题或提供进一步帮助的建议结束你的结果。
- command: (可选) 执行一个CLI命令以向用户展示结果的实时演示。例如，使用\`open index.html\`来显示创建的html网站，或\`open localhost:3000\`来显示本地运行的开发服务器。但不要使用像\`echo\`或\`cat\`这样的命令，这些命令仅仅打印文本。此命令应对当前操作系统有效。确保命令格式正确且不包含任何有害指令。
用法:
<attempt_completion>
<result>
你的最终结果描述在这里
</result>
<command>用于展示结果的命令（可选）</command>
</attempt_completion>

示例: 请求尝试完成一个结果和命令
<attempt_completion>
<result>
我已更新CSS
</result>
<command>open index.html</command>
</attempt_completion>`
}
