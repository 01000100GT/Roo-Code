export function getAskFollowupQuestionDescription(): string {
	return `## ask_followup_question
Description: 向用户提问以收集完成任务所需的额外信息。当您遇到歧义、需要澄清或需要更多细节以有效进行时，应使用此工具。它通过启用与用户的直接通信来实现互动式问题解决。谨慎使用此工具，以在收集必要信息和避免过多往返之间保持平衡。
Parameters:
- question: (required) 向用户提问的问题。这应该是一个明确、具体的问题，以解决您需要的信息。
Usage:
<ask_followup_question>
<question>Your question here</question>
</ask_followup_question>

Example: 请求用户提供frontend-config.json文件的路径
<ask_followup_question>
<question>What is the path to the frontend-config.json file?</question>
</ask_followup_question>`
}
