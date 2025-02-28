import defaultShell from "default-shell"
import os from "os"
import osName from "os-name"
import { Mode, ModeConfig, getModeBySlug, defaultModeSlug, isToolAllowedForMode } from "../../../shared/modes"
import { getShell } from "../../../utils/shell"

export function getSystemInfoSection(cwd: string, currentMode: Mode, customModes?: ModeConfig[]): string {
	const findModeBySlug = (slug: string, modes?: ModeConfig[]) => modes?.find((m) => m.slug === slug)

	const currentModeName = findModeBySlug(currentMode, customModes)?.name || currentMode
	const codeModeName = findModeBySlug(defaultModeSlug, customModes)?.name || "Code"

	let details = `====

系统信息

操作系统: ${osName()}
默认Shell: ${getShell()}
主目录: ${os.homedir().toPosix()}
当前工作目录: ${cwd.toPosix()}

当用户最初给你一个任务时，当前工作目录（'/test/path')中所有文件路径的递归列表将包含在environment_details中。这提供了项目文件结构的概览,从目录/文件名(开发者如何概念化和组织他们的代码)和文件扩展名(使用的语言)中提供关键见解。这也可以指导决定进一步探索哪些文件。如果你需要进一步探索诸如当前工作目录之外的目录,可以使用list_files工具。如果你为递归参数传递'true'，它将递归列出文件。否则，它将在顶层列出文件，这更适合于不需要嵌套结构的通用目录，如桌面。`

	return details
}
