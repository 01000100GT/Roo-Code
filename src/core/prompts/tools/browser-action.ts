import { ToolArgs } from "./types"

export function getBrowserActionDescription(args: ToolArgs): string | undefined {
	if (!args.supportsComputerUse) {
		return undefined
	}
	return `## browser_action
描述: 请求与一个由Puppeteer控制的浏览器进行交互。每个动作，除了\`close\`，都会以浏览器当前状态的截图和任何新的控制台日志作为回应。每条消息只能执行一个浏览器动作，并等待用户的响应，包括截图和日志，以确定下一个动作。
- 动作序列**必须始于**在一个URL上启动浏览器，并**必须以**关闭浏览器结束。如果需要访问一个无法从当前网页导航到的新URL，必须先关闭浏览器，然后在新URL上重新启动。
- 当浏览器处于活动状态时，只能使用\`browser_action\`工具。在此期间不应调用其他工具。只有在关闭浏览器后才能继续使用其他工具。例如，如果遇到错误需要修复文件，必须关闭浏览器，然后使用其他工具进行必要的更改，然后重新启动浏览器以验证结果。
- 浏览器窗口的分辨率为**${args.browserViewportSize}**像素。执行任何点击操作时，请确保坐标在此分辨率范围内。
- 在点击任何元素（如图标、链接或按钮）之前，必须查看提供的页面截图以确定元素的坐标。点击应定位在元素的**中心**，而不是其边缘。
参数:
- action: (必需) 要执行的动作。可用的动作有:
    * launch: 在指定的URL上启动一个新的由Puppeteer控制的浏览器实例。这**必须始终是第一个动作**。
        - 使用\`url\`参数提供URL。
        - 确保URL有效并包含适当的协议（例如http://localhost:3000/page, file:///path/to/file.html等）。
    * click: 在特定的x,y坐标上点击。
        - 使用\`coordinate\`参数指定位置。
        - 始终在元素（图标、按钮、链接等）的中心点击，基于从截图中得出的坐标。
    * type: 在键盘上输入一串文本。可以在点击文本字段后使用此功能输入文本。
        - 使用\`text\`参数提供要输入的字符串。
    * scroll_down: 向下滚动页面一个页面高度。
    * scroll_up: 向上滚动页面一个页面高度。
    * close: 关闭由Puppeteer控制的浏览器实例。这**必须始终是最后一个浏览器动作**。
        - 示例: \`<action>close</action>\`
- url: (可选) 用于提供\`launch\`动作的URL。
    * 示例: <url>https://example.com</url>
- coordinate: (可选) \`click\`动作的X和Y坐标。坐标应在**${args.browserViewportSize}**分辨率内。
    * 示例: <coordinate>450,300</coordinate>
- text: (可选) 用于提供\`type\`动作的文本。
    * 示例: <text>Hello, world!</text>
用法:
<browser_action>
<action>要执行的动作（例如，launch, click, type, scroll_down, scroll_up, close）</action>
<url>要在其上启动浏览器的URL（可选）</url>
<coordinate>x,y坐标（可选）</coordinate>
<text>要输入的文本（可选）</text>
</browser_action>

示例: 请求在https://example.com上启动浏览器
<browser_action>
<action>launch</action>
<url>https://example.com</url>
</browser_action>

示例: 请求点击坐标450,300处的元素
<browser_action>
<action>click</action>
<coordinate>450,300</coordinate>
</browser_action>`
}
