import { VSCodeButton, VSCodeCheckbox, VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import { ExtensionStateContextType, useExtensionState } from "../../context/ExtensionStateContext"
import { validateApiConfiguration, validateModelId } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import ApiOptions from "./ApiOptions"
import ExperimentalFeature from "./ExperimentalFeature"
import { EXPERIMENT_IDS, experimentConfigsMap, ExperimentId } from "../../../../src/shared/experiments"
import ApiConfigManager from "./ApiConfigManager"
import { Dropdown } from "vscrui"
import type { DropdownOption } from "vscrui"
import { ApiConfiguration } from "../../../../src/shared/api"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
	AlertDialogHeader,
	AlertDialogFooter,
} from "../ui/alert-dialog"

type SettingsViewProps = {
	onDone: () => void
}

export interface SettingsViewRef {
	checkUnsaveChanges: (then: () => void) => void
}

const SettingsView = forwardRef<SettingsViewRef, SettingsViewProps>(({ onDone }, ref) => {
	const extensionState = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)
	const [commandInput, setCommandInput] = useState("")
	const [isDiscardDialogShow, setDiscardDialogShow] = useState(false)
	const [cachedState, setCachedState] = useState(extensionState)
	const [isChangeDetected, setChangeDetected] = useState(false)
	const prevApiConfigName = useRef(extensionState.currentApiConfigName)
	const confirmDialogHandler = useRef<() => void>()

	// TODO: Reduce WebviewMessage/ExtensionState complexity
	const { currentApiConfigName } = extensionState
	const {
		apiConfiguration,
		alwaysAllowReadOnly,
		allowedCommands,
		alwaysAllowBrowser,
		alwaysAllowExecute,
		alwaysAllowMcp,
		alwaysAllowModeSwitch,
		alwaysAllowWrite,
		alwaysApproveResubmit,
		browserViewportSize,
		checkpointsEnabled,
		diffEnabled,
		experiments,
		fuzzyMatchThreshold,
		maxOpenTabsContext,
		mcpEnabled,
		rateLimitSeconds,
		requestDelaySeconds,
		screenshotQuality,
		soundEnabled,
		soundVolume,
		terminalOutputLineLimit,
		writeDelayMs,
	} = cachedState

	useEffect(() => {
		// Update only when currentApiConfigName is changed
		// Expected to be triggered by loadApiConfiguration/upsertApiConfiguration
		if (prevApiConfigName.current === currentApiConfigName) {
			return
		}
		setCachedState((prevCachedState) => ({
			...prevCachedState,
			...extensionState,
		}))
		prevApiConfigName.current = currentApiConfigName
		setChangeDetected(false)
	}, [currentApiConfigName, extensionState, isChangeDetected])

	const setCachedStateField = useCallback(
		<K extends keyof ExtensionStateContextType>(field: K, value: ExtensionStateContextType[K]) => {
			setCachedState((prevState) => {
				if (prevState[field] === value) {
					return prevState
				}
				setChangeDetected(true)
				return {
					...prevState,
					[field]: value,
				}
			})
		},
		[],
	)

	const setApiConfigurationField = useCallback(
		<K extends keyof ApiConfiguration>(field: K, value: ApiConfiguration[K]) => {
			setCachedState((prevState) => {
				if (prevState.apiConfiguration?.[field] === value) {
					return prevState
				}
				setChangeDetected(true)
				return {
					...prevState,
					apiConfiguration: {
						...prevState.apiConfiguration,
						[field]: value,
					},
				}
			})
		},
		[],
	)

	const setExperimentEnabled = useCallback((id: ExperimentId, enabled: boolean) => {
		setCachedState((prevState) => {
			if (prevState.experiments?.[id] === enabled) {
				return prevState
			}
			setChangeDetected(true)
			return {
				...prevState,
				experiments: { ...prevState.experiments, [id]: enabled },
			}
		})
	}, [])

	const handleSubmit = () => {
		const apiValidationResult = validateApiConfiguration(apiConfiguration)
		const modelIdValidationResult = validateModelId(
			apiConfiguration,
			extensionState.glamaModels,
			extensionState.openRouterModels,
		)

		setApiErrorMessage(apiValidationResult)
		setModelIdErrorMessage(modelIdValidationResult)
		if (!apiValidationResult && !modelIdValidationResult) {
			vscode.postMessage({ type: "alwaysAllowReadOnly", bool: alwaysAllowReadOnly })
			vscode.postMessage({ type: "alwaysAllowWrite", bool: alwaysAllowWrite })
			vscode.postMessage({ type: "alwaysAllowExecute", bool: alwaysAllowExecute })
			vscode.postMessage({ type: "alwaysAllowBrowser", bool: alwaysAllowBrowser })
			vscode.postMessage({ type: "alwaysAllowMcp", bool: alwaysAllowMcp })
			vscode.postMessage({ type: "allowedCommands", commands: allowedCommands ?? [] })
			vscode.postMessage({ type: "soundEnabled", bool: soundEnabled })
			vscode.postMessage({ type: "soundVolume", value: soundVolume })
			vscode.postMessage({ type: "diffEnabled", bool: diffEnabled })
			vscode.postMessage({ type: "checkpointsEnabled", bool: checkpointsEnabled })
			vscode.postMessage({ type: "browserViewportSize", text: browserViewportSize })
			vscode.postMessage({ type: "fuzzyMatchThreshold", value: fuzzyMatchThreshold ?? 1.0 })
			vscode.postMessage({ type: "writeDelayMs", value: writeDelayMs })
			vscode.postMessage({ type: "screenshotQuality", value: screenshotQuality ?? 75 })
			vscode.postMessage({ type: "terminalOutputLineLimit", value: terminalOutputLineLimit ?? 500 })
			vscode.postMessage({ type: "mcpEnabled", bool: mcpEnabled })
			vscode.postMessage({ type: "alwaysApproveResubmit", bool: alwaysApproveResubmit })
			vscode.postMessage({ type: "requestDelaySeconds", value: requestDelaySeconds })
			vscode.postMessage({ type: "rateLimitSeconds", value: rateLimitSeconds })
			vscode.postMessage({ type: "maxOpenTabsContext", value: maxOpenTabsContext })
			vscode.postMessage({ type: "currentApiConfigName", text: currentApiConfigName })
			vscode.postMessage({
				type: "updateExperimental",
				values: experiments,
			})
			vscode.postMessage({ type: "alwaysAllowModeSwitch", bool: alwaysAllowModeSwitch })

			vscode.postMessage({
				type: "upsertApiConfiguration",
				text: currentApiConfigName,
				apiConfiguration,
			})
			// onDone()
			setChangeDetected(false)
		}
	}

	useEffect(() => {
		setApiErrorMessage(undefined)
		setModelIdErrorMessage(undefined)
	}, [apiConfiguration])

	// Initial validation on mount
	useEffect(() => {
		const apiValidationResult = validateApiConfiguration(apiConfiguration)
		const modelIdValidationResult = validateModelId(
			apiConfiguration,
			extensionState.glamaModels,
			extensionState.openRouterModels,
		)
		setApiErrorMessage(apiValidationResult)
		setModelIdErrorMessage(modelIdValidationResult)
	}, [apiConfiguration, extensionState.glamaModels, extensionState.openRouterModels])

	const checkUnsaveChanges = useCallback(
		(then: () => void) => {
			if (isChangeDetected) {
				confirmDialogHandler.current = then
				setDiscardDialogShow(true)
			} else {
				then()
			}
		},
		[isChangeDetected],
	)

	useImperativeHandle(
		ref,
		() => ({
			checkUnsaveChanges,
		}),
		[checkUnsaveChanges],
	)

	const onConfirmDialogResult = useCallback((confirm: boolean) => {
		if (confirm) {
			confirmDialogHandler.current?.()
		}
	}, [])

	const handleResetState = () => {
		vscode.postMessage({ type: "resetState" })
	}

	const handleAddCommand = () => {
		const currentCommands = allowedCommands ?? []
		if (commandInput && !currentCommands.includes(commandInput)) {
			const newCommands = [...currentCommands, commandInput]
			setCachedStateField("allowedCommands", newCommands)
			setCommandInput("")
			vscode.postMessage({
				type: "allowedCommands",
				commands: newCommands,
			})
		}
	}

	const sliderLabelStyle = {
		minWidth: "45px",
		textAlign: "right" as const,
		lineHeight: "20px",
		paddingBottom: "2px",
	}

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				padding: "10px 0px 0px 20px",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			<AlertDialog open={isDiscardDialogShow} onOpenChange={setDiscardDialogShow}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unsaved changes</AlertDialogTitle>
						<AlertDialogDescription>
							<span className={`codicon codicon-warning align-middle mr-1`} />
							Do you want to discard changes and continue?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => onConfirmDialogResult(true)}>Yes</AlertDialogAction>
						<AlertDialogCancel onClick={() => onConfirmDialogResult(false)}>No</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "17px",
					paddingRight: 17,
				}}>
				<h3 style={{ color: "var(--vscode-foreground)", margin: 0 }}>Settings</h3>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						gap: "6px",
					}}>
					<VSCodeButton
						appearance="primary"
						title={isChangeDetected ? "Save changes" : "Nothing changed"}
						onClick={handleSubmit}
						disabled={!isChangeDetected}>
						Save
					</VSCodeButton>
					<VSCodeButton
						appearance="secondary"
						title="Discard unsaved changes and close settings panel"
						onClick={() => checkUnsaveChanges(onDone)}>
						Done
					</VSCodeButton>
				</div>
			</div>
			<div
				style={{ flexGrow: 1, overflowY: "scroll", paddingRight: 8, display: "flex", flexDirection: "column" }}>
				<div style={{ marginBottom: 40 }}>
					<h3 style={{ color: "var(--vscode-foreground)", margin: "0 0 15px 0" }}>Provider设置</h3>
					<div style={{ marginBottom: 15 }}>
						<ApiConfigManager
							currentApiConfigName={currentApiConfigName}
							listApiConfigMeta={extensionState.listApiConfigMeta}
							onSelectConfig={(configName: string) => {
								checkUnsaveChanges(() => {
									vscode.postMessage({
										type: "loadApiConfiguration",
										text: configName,
									})
								})
							}}
							onDeleteConfig={(configName: string) => {
								vscode.postMessage({
									type: "deleteApiConfiguration",
									text: configName,
								})
							}}
							onRenameConfig={(oldName: string, newName: string) => {
								vscode.postMessage({
									type: "renameApiConfiguration",
									values: { oldName, newName },
									apiConfiguration,
								})
								prevApiConfigName.current = newName
							}}
							onUpsertConfig={(configName: string) => {
								vscode.postMessage({
									type: "upsertApiConfiguration",
									text: configName,
									apiConfiguration,
								})
							}}
						/>
						<ApiOptions
							uriScheme={extensionState.uriScheme}
							apiConfiguration={apiConfiguration}
							setApiConfigurationField={setApiConfigurationField}
							apiErrorMessage={apiErrorMessage}
							modelIdErrorMessage={modelIdErrorMessage}
						/>
					</div>
				</div>

				<div style={{ marginBottom: 40 }}>
					<h3 style={{ color: "var(--vscode-foreground)", margin: "0 0 15px 0" }}>
						Auto-Approve(自动授权) Settings
					</h3>
					<p style={{ fontSize: "12px", marginBottom: 15, color: "var(--vscode-descriptionForeground)" }}>
						以下设置允许Roo自动执行操作，无需授权。仅当您完全信任AI并了解相关安全性时，才启用这些设置风险。
					</p>

					<div style={{ marginBottom: 15 }}>
						<VSCodeCheckbox
							checked={alwaysAllowReadOnly}
							onChange={(e: any) => setCachedStateField("alwaysAllowReadOnly", e.target.checked)}>
							<span style={{ fontWeight: "500" }}>Always approve read-only operations</span>
						</VSCodeCheckbox>
						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
							启用后，Roo将自动查看目录内容和读取文件，而无需您单击“批准”按钮。
						</p>
					</div>

					<div style={{ marginBottom: 15 }}>
						<VSCodeCheckbox
							checked={alwaysAllowWrite}
							onChange={(e: any) => setCachedStateField("alwaysAllowWrite", e.target.checked)}>
							<span style={{ fontWeight: "500" }}>Always approve write operations</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							自动创建和编辑文件，无需授权
						</p>
						{alwaysAllowWrite && (
							<div
								style={{
									marginTop: 10,
									paddingLeft: 10,
									borderLeft: "2px solid var(--vscode-button-background)",
								}}>
								<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
									<input
										type="range"
										min="0"
										max="5000"
										step="100"
										value={writeDelayMs}
										onChange={(e) => setCachedStateField("writeDelayMs", parseInt(e.target.value))}
										className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
									/>
									<span style={{ minWidth: "45px", textAlign: "left" }}>{writeDelayMs}ms</span>
								</div>
								<p
									style={{
										fontSize: "12px",
										marginTop: "5px",
										color: "var(--vscode-descriptionForeground)",
									}}>
									写入后延迟，以允许诊断检测潜在问题
								</p>
							</div>
						)}
					</div>

					<div style={{ marginBottom: 15 }}>
						<VSCodeCheckbox
							checked={alwaysAllowBrowser}
							onChange={(e: any) => setCachedStateField("alwaysAllowBrowser", e.target.checked)}>
							<span style={{ fontWeight: "500" }}>Always approve browser actions</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							无需批准即可自动执行浏览器操作
							<br />
							Note: 仅适用于型号支持的计算机的情况使用
						</p>
					</div>

					<div style={{ marginBottom: 15 }}>
						<VSCodeCheckbox
							checked={alwaysApproveResubmit}
							onChange={(e: any) => setCachedStateField("alwaysApproveResubmit", e.target.checked)}>
							<span style={{ fontWeight: "500" }}>Always retry failed API requests</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							当服务器返回错误响应时，自动重试失败的API请求
						</p>
						{alwaysApproveResubmit && (
							<div
								style={{
									marginTop: 10,
									paddingLeft: 10,
									borderLeft: "2px solid var(--vscode-button-background)",
								}}>
								<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
									<input
										type="range"
										min="5"
										max="100"
										step="1"
										value={requestDelaySeconds}
										onChange={(e) =>
											setCachedStateField("requestDelaySeconds", parseInt(e.target.value))
										}
										className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
									/>
									<span style={{ minWidth: "45px", textAlign: "left" }}>{requestDelaySeconds}s</span>
								</div>
								<p
									style={{
										fontSize: "12px",
										marginTop: "5px",
										color: "var(--vscode-descriptionForeground)",
									}}>
									重试请求前的延迟
								</p>
							</div>
						)}
					</div>

					<div style={{ marginBottom: 5 }}>
						<VSCodeCheckbox
							checked={alwaysAllowMcp}
							onChange={(e: any) => setCachedStateField("alwaysAllowMcp", e.target.checked)}>
							<span style={{ fontWeight: "500" }}>Always approve MCP tools</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							自动授权在MCP服务器视图中启用的MCP工具（需要这个 设置和MCP工具那里都勾选上“始终允许”复选框）
						</p>
					</div>

					<div style={{ marginBottom: 15 }}>
						<VSCodeCheckbox
							checked={alwaysAllowModeSwitch}
							onChange={(e: any) => setCachedStateField("alwaysAllowModeSwitch", e.target.checked)}>
							<span style={{ fontWeight: "500" }}>Always approve mode switching & task creation</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							在不同的AI模式之间自动切换并创建新任务，而无需批准
						</p>
					</div>

					<div style={{ marginBottom: 15 }}>
						<VSCodeCheckbox
							checked={alwaysAllowExecute}
							onChange={(e: any) => setCachedStateField("alwaysAllowExecute", e.target.checked)}>
							<span style={{ fontWeight: "500" }}>Always approve allowed execute operations</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							自动执行允许的终端命令，无需批准
						</p>

						{alwaysAllowExecute && (
							<div
								style={{
									marginTop: 10,
									paddingLeft: 10,
									borderLeft: "2px solid var(--vscode-button-background)",
								}}>
								<span style={{ fontWeight: "500" }}>Allowed Auto-Execute Commands</span>
								<p
									style={{
										fontSize: "12px",
										marginTop: "5px",
										color: "var(--vscode-descriptionForeground)",
									}}>
									当"Always approve execute operations"被勾选时可执行的命令前缀。 填加 *
									以允许所有命令（谨慎使用）。
								</p>

								<div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
									<VSCodeTextField
										value={commandInput}
										onInput={(e: any) => setCommandInput(e.target.value)}
										onKeyDown={(e: any) => {
											if (e.key === "Enter") {
												e.preventDefault()
												handleAddCommand()
											}
										}}
										placeholder="Enter command prefix (e.g., 'git ')"
										style={{ flexGrow: 1 }}
									/>
									<VSCodeButton onClick={handleAddCommand}>Add</VSCodeButton>
								</div>

								<div
									style={{
										marginTop: "10px",
										display: "flex",
										flexWrap: "wrap",
										gap: "5px",
									}}>
									{(allowedCommands ?? []).map((cmd, index) => (
										<div
											key={index}
											className="border border-vscode-input-border bg-primary text-primary-foreground flex items-center gap-1 rounded-xs px-1.5 p-0.5">
											<span>{cmd}</span>
											<VSCodeButton
												appearance="icon"
												className="text-primary-foreground"
												onClick={() => {
													const newCommands = (allowedCommands ?? []).filter(
														(_, i) => i !== index,
													)
													setCachedStateField("allowedCommands", newCommands)
													vscode.postMessage({
														type: "allowedCommands",
														commands: newCommands,
													})
												}}>
												<span className="codicon codicon-close" />
											</VSCodeButton>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				<div style={{ marginBottom: 40 }}>
					<h3 style={{ color: "var(--vscode-foreground)", margin: "0 0 15px 0" }}>Browser Settings</h3>
					<div style={{ marginBottom: 15 }}>
						<label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>Viewport size</label>
						<div className="dropdown-container">
							<Dropdown
								value={browserViewportSize}
								onChange={(value: unknown) => {
									setCachedStateField("browserViewportSize", (value as DropdownOption).value)
								}}
								style={{ width: "100%" }}
								options={[
									{ value: "1280x800", label: "Large Desktop (1280x800)" },
									{ value: "900x600", label: "Small Desktop (900x600)" },
									{ value: "768x1024", label: "Tablet (768x1024)" },
									{ value: "360x640", label: "Mobile (360x640)" },
								]}
							/>
						</div>
						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
							选择浏览器交互的视窗大小。这会影响网站的显示和互动。
						</p>
					</div>

					<div style={{ marginBottom: 15 }}>
						<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
							<span style={{ fontWeight: "500" }}>Screenshot quality</span>
							<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
								<input
									type="range"
									min="1"
									max="100"
									step="1"
									value={screenshotQuality ?? 75}
									className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
									onChange={(e) => setCachedStateField("screenshotQuality", parseInt(e.target.value))}
								/>
								<span style={{ ...sliderLabelStyle }}>{screenshotQuality ?? 75}%</span>
							</div>
						</div>
						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
							调整浏览器截图的WebP质量。值越高，屏幕截图越清晰，但增加令牌使用。
						</p>
					</div>
				</div>

				<div style={{ marginBottom: 40 }}>
					<h3 style={{ color: "var(--vscode-foreground)", margin: "0 0 15px 0" }}>Notification Settings</h3>
					<div style={{ marginBottom: 15 }}>
						<VSCodeCheckbox
							checked={soundEnabled}
							onChange={(e: any) => setCachedStateField("soundEnabled", e.target.checked)}>
							<span style={{ fontWeight: "500" }}>Enable sound effects</span>
						</VSCodeCheckbox>
						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
							启用后，Roo将为通知和事件播放音效。
						</p>
					</div>
					{soundEnabled && (
						<div
							style={{
								marginLeft: 0,
								paddingLeft: 10,
								borderLeft: "2px solid var(--vscode-button-background)",
							}}>
							<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
								<span style={{ fontWeight: "500", minWidth: "100px" }}>Volume</span>
								<input
									type="range"
									min="0"
									max="1"
									step="0.01"
									value={soundVolume ?? 0.5}
									onChange={(e) => setCachedStateField("soundVolume", parseFloat(e.target.value))}
									className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
									aria-label="Volume"
								/>
								<span style={{ minWidth: "35px", textAlign: "left" }}>
									{((soundVolume ?? 0.5) * 100).toFixed(0)}%
								</span>
							</div>
						</div>
					)}
				</div>

				<div style={{ marginBottom: 40 }}>
					<h3 style={{ color: "var(--vscode-foreground)", margin: "0 0 15px 0" }}>Advanced Settings</h3>
					<div style={{ marginBottom: 15 }}>
						<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
							<span style={{ fontWeight: "500" }}>Rate limit</span>
							<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
								<input
									type="range"
									min="0"
									max="60"
									step="1"
									value={rateLimitSeconds}
									onChange={(e) => setCachedStateField("rateLimitSeconds", parseInt(e.target.value))}
									className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
								/>
								<span style={{ ...sliderLabelStyle }}>{rateLimitSeconds}s</span>
							</div>
						</div>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							API请求之间的最小时间间隔。
						</p>
					</div>
					<div style={{ marginBottom: 15 }}>
						<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
							<span style={{ fontWeight: "500" }}>Terminal output limit</span>
							<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
								<input
									type="range"
									min="100"
									max="5000"
									step="100"
									value={terminalOutputLineLimit ?? 500}
									onChange={(e) =>
										setCachedStateField("terminalOutputLineLimit", parseInt(e.target.value))
									}
									className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
								/>
								<span style={{ ...sliderLabelStyle }}>{terminalOutputLineLimit ?? 500}</span>
							</div>
						</div>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							执行命令时终端输出中包含的最大行数。超过时将从中间删除行，以节省令牌。
						</p>
					</div>

					<div style={{ marginBottom: 15 }}>
						<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
							<span style={{ fontWeight: "500" }}>Open tabs context limit</span>
							<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
								<input
									type="range"
									min="0"
									max="500"
									step="1"
									value={maxOpenTabsContext ?? 20}
									onChange={(e) =>
										setCachedStateField("maxOpenTabsContext", parseInt(e.target.value))
									}
									className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
								/>
								<span style={{ ...sliderLabelStyle }}>{maxOpenTabsContext ?? 20}</span>
							</div>
						</div>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							包含在上下文中的VSCode打开选项卡的最大数量。更高的值提供更多的上下文 但增加令牌使用。
						</p>
					</div>

					<div style={{ marginBottom: 15 }}>
						<VSCodeCheckbox
							checked={diffEnabled}
							onChange={(e: any) => {
								setCachedStateField("diffEnabled", e.target.checked)
								if (!e.target.checked) {
									// Reset experimental strategy when diffs are disabled
									setExperimentEnabled(EXPERIMENT_IDS.DIFF_STRATEGY, false)
								}
							}}>
							<span style={{ fontWeight: "500" }}>Enable editing through diffs</span>
						</VSCodeCheckbox>
						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
							启用后，Roo将能够更快地编辑文件，并自动拒绝截断的完整文件写入。与最新的Claude 3.7
							Sonnet型号配合使用效果最佳。
						</p>

						{diffEnabled && (
							<div style={{ marginTop: 10 }}>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "5px",
										marginTop: "10px",
										marginBottom: "10px",
										paddingLeft: "10px",
										borderLeft: "2px solid var(--vscode-button-background)",
									}}>
									<span style={{ fontWeight: "500" }}>Match precision</span>
									<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
										<input
											type="range"
											min="0.8"
											max="1"
											step="0.005"
											value={fuzzyMatchThreshold ?? 1.0}
											onChange={(e) => {
												setCachedStateField("fuzzyMatchThreshold", parseFloat(e.target.value))
											}}
											className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
										/>
										<span style={{ ...sliderLabelStyle }}>
											{Math.round((fuzzyMatchThreshold || 1) * 100)}%
										</span>
									</div>
									<p
										style={{
											fontSize: "12px",
											marginTop: "5px",
											color: "var(--vscode-descriptionForeground)",
										}}>
										此滑块控制应用差异时代码段必须匹配的精确程度。较低的值允许更灵活的匹配，但会增加不正确的风险。使用低于100%的值时要格外小心。
									</p>
									<ExperimentalFeature
										key={EXPERIMENT_IDS.DIFF_STRATEGY}
										{...experimentConfigsMap.DIFF_STRATEGY}
										enabled={experiments[EXPERIMENT_IDS.DIFF_STRATEGY] ?? false}
										onChange={(enabled) =>
											setExperimentEnabled(EXPERIMENT_IDS.DIFF_STRATEGY, enabled)
										}
									/>
								</div>
							</div>
						)}

						<div style={{ marginBottom: 15 }}>
							<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
								<span style={{ color: "var(--vscode-errorForeground)" }}>⚠️</span>
								<VSCodeCheckbox
									checked={checkpointsEnabled}
									onChange={(e: any) => {
										setCachedStateField("checkpointsEnabled", e.target.checked)
									}}>
									<span style={{ fontWeight: "500" }}>Enable experimental checkpoints</span>
								</VSCodeCheckbox>
							</div>
							<p
								style={{
									fontSize: "12px",
									marginTop: "5px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								启用后，每当工作区中的文件被修改、添加或删除时，Roo
								将保存一个检查点，让您可以轻松地恢复到以前的状态。
							</p>
						</div>

						{Object.entries(experimentConfigsMap)
							.filter((config) => config[0] !== "DIFF_STRATEGY")
							.map((config) => (
								<ExperimentalFeature
									key={config[0]}
									{...config[1]}
									enabled={
										experiments[EXPERIMENT_IDS[config[0] as keyof typeof EXPERIMENT_IDS]] ?? false
									}
									onChange={(enabled) =>
										setExperimentEnabled(
											EXPERIMENT_IDS[config[0] as keyof typeof EXPERIMENT_IDS],
											enabled,
										)
									}
								/>
							))}
					</div>
				</div>

				<div
					style={{
						textAlign: "center",
						color: "var(--vscode-descriptionForeground)",
						fontSize: "12px",
						lineHeight: "1.2",
						marginTop: "auto",
						padding: "10px 8px 15px 0px",
					}}>
					<p style={{ wordWrap: "break-word", margin: 0, padding: 0 }}>
						If you have any questions or feedback, feel free to open an issue at{" "}
						<VSCodeLink href="https://github.com/RooVetGit/Roo-Code" style={{ display: "inline" }}>
							github.com/RooVetGit/Roo-Code
						</VSCodeLink>{" "}
						or join{" "}
						<VSCodeLink href="https://www.reddit.com/r/RooCode/" style={{ display: "inline" }}>
							reddit.com/r/RooCode
						</VSCodeLink>
					</p>
					<p style={{ fontStyle: "italic", margin: "10px 0 0 0", padding: 0, marginBottom: 100 }}>
						v{extensionState.version}
					</p>

					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						这将重置扩展中的所有全局状态和秘密存储。
					</p>

					<VSCodeButton
						onClick={handleResetState}
						appearance="secondary"
						style={{ marginTop: "5px", width: "auto" }}>
						Reset State
					</VSCodeButton>
				</div>
			</div>
		</div>
	)
})

export default memo(SettingsView)
