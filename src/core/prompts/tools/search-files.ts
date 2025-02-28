import { ToolArgs } from "./types"

export function getSearchFilesDescription(args: ToolArgs): string {
	return `## search_files
Description: 请求在指定目录中执行正则表达式搜索，提供丰富的上下文结果。此工具搜索多个文件中的模式或特定内容，显示每个匹配项及其上下文。
Parameters:
- path: (必需) 要搜索的目录路径(相对于当前工作目录 ${args.cwd})。此目录将被递归搜索。
- regex: (必需) 要搜索的正则表达式模式。使用Rust正则表达式语法。
- file_pattern: (可选) 用于过滤文件的Glob模式(例如，'*.ts'表示TypeScript文件)。如果未提供，将搜索所有文件(*)。
Usage:
<search_files>
<path>在此处输入目录路径</path>
<regex>在此处输入您的正则表达式模式</regex>
<file_pattern>在此处输入文件模式(可选)</file_pattern>
</search_files>

Example: 请求搜索当前目录中的所有.ts文件
<search_files>
<path>.</path>
<regex>.*</regex>
<file_pattern>*.ts</file_pattern>
</search_files>`
}
