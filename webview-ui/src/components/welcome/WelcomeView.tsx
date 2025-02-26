import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useState } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { validateApiConfiguration } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import ApiOptions from "../settings/ApiOptions"

const WelcomeView = () => {
	const { apiConfiguration, currentApiConfigName, setApiConfiguration, uriScheme } = useExtensionState()

	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

	const handleSubmit = useCallback(() => {
		const error = validateApiConfiguration(apiConfiguration)
		if (error) {
			setErrorMessage(error)
			return
		}
		setErrorMessage(undefined)
		vscode.postMessage({
			type: "upsertApiConfiguration",
			text: currentApiConfigName,
			apiConfiguration,
		})
	}, [apiConfiguration, currentApiConfigName])

	return (
		<div className="flex flex-col min-h-screen px-0 pb-5">
			<h2>你好，我是Roo！</h2>
			<p>
				我具备智能体编码能力，支持文件创建/编辑、复杂工程解析、浏览器操作、终端指令执行（需授权）等工具调用，并能通过MCP协议实现能力自扩展。
			</p>

			<b>使用前需配置API服务提供方。</b>

			<div className="mt-3">
				<ApiOptions
					fromWelcomeView
					apiConfiguration={apiConfiguration || {}}
					uriScheme={uriScheme}
					setApiConfigurationField={(field, value) => setApiConfiguration({ [field]: value })}
				/>
			</div>

			<div className="sticky bottom-0 bg-[var(--vscode-sideBar-background)] py-3">
				<div className="flex flex-col gap-1.5">
					<VSCodeButton onClick={handleSubmit}>Let's go!</VSCodeButton>
					{errorMessage && <span className="text-destructive">{errorMessage}</span>}
				</div>
			</div>
		</div>
	)
}

export default WelcomeView
