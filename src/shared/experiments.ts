export const EXPERIMENT_IDS = {
	DIFF_STRATEGY: "experimentalDiffStrategy",
	SEARCH_AND_REPLACE: "search_and_replace",
	INSERT_BLOCK: "insert_content",
	POWER_STEERING: "powerSteering",
} as const

export type ExperimentKey = keyof typeof EXPERIMENT_IDS
export type ExperimentId = valueof<typeof EXPERIMENT_IDS>

export interface ExperimentConfig {
	name: string
	description: string
	enabled: boolean
}

type valueof<X> = X[keyof X]

export const experimentConfigsMap: Record<ExperimentKey, ExperimentConfig> = {
	DIFF_STRATEGY: {
		name: "Use experimental unified diff strategy",
		description:
			"启用实验性的统一差异策略。此策略可能会减少由于模型错误导致的重试次数，但可能会导致意外行为或错误编辑。只有在您了解风险并愿意仔细审查所有更改的情况下才启用。",
		enabled: false,
	},
	SEARCH_AND_REPLACE: {
		name: "Use experimental search and replace tool",
		description: "启用实验性的搜索和替换工具，允许Roo在一个请求中替换多个搜索词实例。",
		enabled: false,
	},
	INSERT_BLOCK: {
		name: "Use experimental insert content tool",

		description: "启用实验性的插入内容工具，允许Roo在特定行号插入内容，而无需创建差异。",
		enabled: false,
	},
	POWER_STEERING: {
		name: 'Use experimental "power steering" mode',
		description:
			"启用后，Roo将更频繁地提醒模型其当前模式定义的详细信息。这将导致更强的角色定义和自定义指令的遵循，但每条消息将使用更多的tokens。",
		enabled: false,
	},
}

export const experimentDefault = Object.fromEntries(
	Object.entries(experimentConfigsMap).map(([_, config]) => [
		EXPERIMENT_IDS[_ as keyof typeof EXPERIMENT_IDS] as ExperimentId,
		config.enabled,
	]),
) as Record<ExperimentId, boolean>

export const experiments = {
	get: (id: ExperimentKey): ExperimentConfig | undefined => {
		return experimentConfigsMap[id]
	},
	isEnabled: (experimentsConfig: Record<ExperimentId, boolean>, id: ExperimentId): boolean => {
		return experimentsConfig[id] ?? experimentDefault[id]
	},
} as const

// Expose experiment details for UI - pre-compute from map for better performance
export const experimentLabels = Object.fromEntries(
	Object.entries(experimentConfigsMap).map(([_, config]) => [
		EXPERIMENT_IDS[_ as keyof typeof EXPERIMENT_IDS] as ExperimentId,
		config.name,
	]),
) as Record<string, string>

export const experimentDescriptions = Object.fromEntries(
	Object.entries(experimentConfigsMap).map(([_, config]) => [
		EXPERIMENT_IDS[_ as keyof typeof EXPERIMENT_IDS] as ExperimentId,
		config.description,
	]),
) as Record<string, string>
