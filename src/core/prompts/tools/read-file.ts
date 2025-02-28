import { ToolArgs } from "./types"

export function getReadFileDescription(args: ToolArgs): string {
	return `## read_file
Description: 请求读取指定路径文件的内容。当你需要检查一个你不知道内容的现有文件时使用，例如分析代码、查看文本文件或从配置文件中提取信息。输出包括每行前缀的行号（例如 "1 | const x = 1"），使得在创建差异或讨论代码时更容易引用特定行。自动从PDF和DOCX文件中提取原始文本。可能不适合其他类型的二进制文件，因为它将原始内容作为字符串返回。
Parameters:
- path: (required) 要读取的文件路径（相对于当前工作目录 ${args.cwd}）
Usage:
<read_file>
<path>在这里输入文件路径</path>
</read_file>

Example: 请求读取frontend-config.json
<read_file>
<path>frontend-config.json</path>
</read_file>`
}
