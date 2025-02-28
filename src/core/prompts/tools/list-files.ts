import { ToolArgs } from "./types"

export function getListFilesDescription(args: ToolArgs): string {
	return `## list_files
Description: 请求列出指定目录中的文件和目录。如果recursive为true，它将递归列出所有文件和目录。如果recursive为false或未提供，它将仅列出顶层内容。不要使用此工具来确认您可能已创建的文件是否存在，因为用户会让您知道文件是否创建成功。
Parameters:
- path: (required) 要列出内容的目录路径（相对于当前工作目录${args.cwd}）
- recursive: (optional) 是否递归列出文件。使用true进行递归列出，false或省略则仅列出顶层。
Usage:
<list_files>
<path>在此处输入目录路径</path>
<recursive>true或false（可选）</recursive>
</list_files>

Example: 请求列出当前目录中的所有文件
<list_files>
<path>.</path>
<recursive>false</recursive>
</list_files>`
}
