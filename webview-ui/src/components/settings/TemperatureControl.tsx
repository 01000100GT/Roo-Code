import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useDebounce } from "react-use"

interface TemperatureControlProps {
	value: number | undefined
	onChange: (value: number | undefined) => void
	maxValue?: number // Some providers like OpenAI use 0-2 range
}

export const TemperatureControl = ({ value, onChange, maxValue = 1 }: TemperatureControlProps) => {
	const [isCustomTemperature, setIsCustomTemperature] = useState(value !== undefined)
	const [inputValue, setInputValue] = useState(value)
	useDebounce(() => onChange(inputValue), 50, [onChange, inputValue])
	// Sync internal state with prop changes when switching profiles
	useEffect(() => {
		const hasCustomTemperature = value !== undefined
		setIsCustomTemperature(hasCustomTemperature)
		setInputValue(value)
	}, [value])

	return (
		<div>
			<VSCodeCheckbox
				checked={isCustomTemperature}
				onChange={(e: any) => {
					const isChecked = e.target.checked
					setIsCustomTemperature(isChecked)
					if (!isChecked) {
						setInputValue(undefined) // Unset the temperature
					} else {
						setInputValue(value ?? 0) // Use the value from apiConfiguration, if set
					}
				}}>
				<span style={{ fontWeight: "500" }}>Use custom temperature</span>
			</VSCodeCheckbox>

			<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
				控制模型响应中的随机性。
			</p>

			{isCustomTemperature && (
				<div
					style={{
						marginTop: 5,
						marginBottom: 10,
						paddingLeft: 10,
						borderLeft: "2px solid var(--vscode-button-background)",
					}}>
					<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
						<input
							type="range"
							min="0"
							max={maxValue}
							step="0.01"
							value={inputValue}
							className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
							onChange={(e) => setInputValue(parseFloat(e.target.value))}
						/>
						<span>{inputValue}</span>
					</div>
					<p style={{ fontSize: "12px", marginTop: "8px", color: "var(--vscode-descriptionForeground)" }}>
						较高的值使输出更随机，较低的值使其更具确定性。
					</p>
				</div>
			)}
		</div>
	)
}
