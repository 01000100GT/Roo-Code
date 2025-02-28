import { ToolArgs } from "./types"

export function getExecuteCommandDescription(args: ToolArgs): string | undefined {
	return `## execute_command
Description: 请求在系统上执行CLI命令。当您需要执行系统操作或运行特定命令以完成用户任务的任何步骤时，请使用此功能。您必须根据用户的系统定制您的命令，并提供命令作用的清晰解释。对于命令链，请使用用户shell的适当链语法。优先执行复杂的CLI命令而不是创建可执行脚本，因为它们更灵活且更易于运行。命令将在当前工作目录中执行：${args.cwd}
Parameters:
- command: (required) 要执行的CLI命令。这应该对当前操作系统有效。确保命令格式正确且不包含任何有害指令。
Usage:
<execute_command>
<command>您的命令在这里</command>
</execute_command>

Example: 请求执行npm run dev
<execute_command>
<command>npm run dev</command>
</execute_command>`
}
