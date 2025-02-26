import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { FormEvent } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"

const McpEnabledToggle = () => {
	const { mcpEnabled, setMcpEnabled } = useExtensionState()

	const handleChange = (e: Event | FormEvent<HTMLElement>) => {
		const target = ("target" in e ? e.target : null) as HTMLInputElement | null
		if (!target) return
		setMcpEnabled(target.checked)
		vscode.postMessage({ type: "mcpEnabled", bool: target.checked })
	}

	return (
		<div style={{ marginBottom: "20px" }}>
			<VSCodeCheckbox checked={mcpEnabled} onChange={handleChange}>
				<span style={{ fontWeight: "500" }}>启动 MCP 服务</span>
			</VSCodeCheckbox>
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				启用后，Roo将能够与MCP服务器交互以实现高级功能。如果你不使用MCP，您可以禁用此功能以减少Roo的令牌使用。
			</p>
		</div>
	)
}

export default McpEnabledToggle
