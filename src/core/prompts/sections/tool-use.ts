export function getSharedToolUseSection(): string {
	return `====

TOOL USE

您可以访问一组工具，这些工具在用户批准后执行。您每条消息可以使用一个工具，并将在用户的响应中收到该工具使用的结果。您逐步使用工具来完成给定任务，每次工具使用都根据上一次工具使用的结果进行。

# Tool Use Formatting

工具使用采用XML样式的标签格式。工具名称用开始和结束标签括起来，每个参数也用自己的标签括起来。结构如下：

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

例如：

<read_file>
<path>src/main.js</path>
</read_file>

始终遵循此格式进行工具使用，以确保正确解析和执行。`
}
