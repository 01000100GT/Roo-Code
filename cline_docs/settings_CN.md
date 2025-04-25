# 设置

## 对于所有设置

1. 将设置添加到模式定义中：

    - 在`schemas/index.ts`中将项目添加到`globalSettingsSchema`
    - 在`schemas/index.ts`中将项目添加到`globalSettingsRecord`
    - 示例：`terminalCommandDelay: z.number().optional(),`

2. 将设置添加到类型定义中：

    - 在`exports/types.ts`中添加项目
    - 在`exports/roo-code.d.ts`中添加项目
    - 在`shared/ExtensionMessage.ts`中添加设置
    - 在`shared/WebviewMessage.ts`中将设置添加到WebviewMessage类型
    - 示例：`terminalCommandDelay?: number | undefined`

3. 添加测试覆盖：
    - 在ClineProvider.test.ts中将设置添加到mockState
    - 为设置持久性和状态更新添加测试用例
    - 在提交更改前确保所有测试通过

## 对于复选框设置

1. 在WebviewMessage.ts中添加消息类型：

    - 将设置名称添加到WebviewMessage类型的类型联合
    - 示例：`| "multisearchDiffEnabled"`

2. 在ExtensionStateContext.tsx中添加设置：

    - 将设置添加到ExtensionStateContextType接口
    - 将setter函数添加到接口
    - 在useState中将设置添加到初始状态
    - 将设置添加到contextValue对象
    - 示例：
        ```typescript
        interface ExtensionStateContextType {
        	multisearchDiffEnabled: boolean
        	setMultisearchDiffEnabled: (value: boolean) => void
        }
        ```

3. 在ClineProvider.ts中添加设置：

    - 将设置名称添加到GlobalStateKey类型联合
    - 在getState中将设置添加到Promise.all数组
    - 在getState中将设置添加到返回值，并设默认值
    - 在getStateToPostToWebview中将设置添加到解构变量
    - 在getStateToPostToWebview中将设置添加到返回值
    - 在setWebviewMessageListener中添加一个case来处理设置的消息类型
    - 示例：
        ```typescript
        case "multisearchDiffEnabled":
          await this.updateGlobalState("multisearchDiffEnabled", message.bool)
          await this.postStateToWebview()
          break
        ```

4. 在SettingsView.tsx中添加复选框UI：

    - 从ExtensionStateContext导入设置及其setter
    - 添加带有设置状态和onChange处理程序的VSCodeCheckbox组件
    - 添加适当的标签和描述文本
    - 示例：
        ```typescript
        <VSCodeCheckbox
          checked={multisearchDiffEnabled}
          onChange={(e: any) => setMultisearchDiffEnabled(e.target.checked)}
        >
          <span style={{ fontWeight: "500" }}>启用多搜索差异匹配</span>
        </VSCodeCheckbox>
        ```

5. 在SettingsView.tsx中将设置添加到handleSubmit：

    - 添加一个vscode.postMessage调用，在点击保存时发送设置的值
    - 这一步对持久性至关重要 - 没有它，用户点击保存时设置将不会被保存
    - 示例：
        ```typescript
        vscode.postMessage({ type: "multisearchDiffEnabled", bool: multisearchDiffEnabled })
        ```

6. 样式考虑：
    - 使用来自@vscode/webview-ui-toolkit/react的VSCodeCheckbox组件，而不是HTML输入元素
    - 为适当间距将每个复选框包装在div元素中
    - 在VSCodeCheckbox组件内部使用带有className="font-medium"的span作为复选框标签
    - 将描述放在带有className="text-vscode-descriptionForeground text-sm mt-1"的单独div中
    - 在配置选项之间保持一致的间距
    - 示例：
        ```typescript
        <div>
          <VSCodeCheckbox
            checked={terminalPowershellCounter ?? true}
            onChange={(e: any) => setCachedStateField("terminalPowershellCounter", e.target.checked)}
            data-testid="terminal-powershell-counter-checkbox">
            <span className="font-medium">{t("settings:terminal.powershellCounter.label")}</span>
          </VSCodeCheckbox>
          <div className="text-vscode-descriptionForeground text-sm mt-1">
            {t("settings:terminal.powershellCounter.description")}
          </div>
        </div>
        ``` 

## 对于选择/下拉菜单设置

1. 在WebviewMessage.ts中添加消息类型：

    - 将设置名称添加到WebviewMessage类型的类型联合
    - 示例：`| "preferredLanguage"`

2. 在ExtensionStateContext.tsx中添加设置：

    - 将设置添加到ExtensionStateContextType接口
    - 将setter函数添加到接口
    - 在useState中将设置添加到初始状态，并设默认值
    - 将设置添加到contextValue对象
    - 示例：
        ```typescript
        interface ExtensionStateContextType {
        	preferredLanguage: string
        	setPreferredLanguage: (value: string) => void
        }
        ```

3. 在ClineProvider.ts中添加设置：

    - 将设置名称添加到GlobalStateKey类型联合
    - 在getState中将设置添加到Promise.all数组
    - 在getState中将设置添加到返回值，并设默认值
    - 在getStateToPostToWebview中将设置添加到解构变量
    - 在getStateToPostToWebview中将设置添加到返回值
    - 这一步对UI显示至关重要 - 没有它，设置将不会在UI中显示
    - 在setWebviewMessageListener中添加一个case来处理设置的消息类型
    - 示例：
        ```typescript
        case "preferredLanguage":
          await this.updateGlobalState("preferredLanguage", message.text)
          await this.postStateToWebview()
          break
        ```

4. 在SettingsView.tsx中添加选择UI：

    - 从ExtensionStateContext导入设置及其setter
    - 添加select元素，并使用适当的样式匹配VSCode的主题
    - 为下拉菜单添加选项
    - 添加适当的标签和描述文本
    - 示例：
        ```typescript
        <select
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value)}
          style={{
            width: "100%",
            padding: "4px 8px",
            backgroundColor: "var(--vscode-input-background)",
            color: "var(--vscode-input-foreground)",
            border: "1px solid var(--vscode-input-border)",
            borderRadius: "2px"
          }}>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          ...
        </select>
        ```

5. 在SettingsView.tsx中将设置添加到handleSubmit：
    - 添加一个vscode.postMessage调用，在点击完成时发送设置的值
    - 示例：
        ```typescript
        vscode.postMessage({ type: "preferredLanguage", text: preferredLanguage })
        ```

这些步骤确保：

- 设置的状态在整个应用程序中具有正确的类型
- 设置在会话之间持久保存
- 设置的值在webview和扩展之间正确同步
- 设置在设置视图中有适当的UI表示
- 为新设置维护测试覆盖

## 添加新配置项：所需更改摘要

要向系统添加新的配置项，需要进行以下更改：

1.  **特定功能的类**（如适用）

    - 针对影响特定功能的设置（如终端、浏览器等）
    - 添加静态属性来存储值
    - 添加getter/setter方法来访问和修改值

2.  **模式定义**

    - 在schemas/index.ts中将项目添加到globalSettingsSchema
    - 在schemas/index.ts中将项目添加到globalSettingsRecord

3.  **类型定义**

    - 在exports/types.ts中添加项目
    - 在exports/roo-code.d.ts中添加项目
    - 在shared/ExtensionMessage.ts中添加项目
    - 在shared/WebviewMessage.ts中添加项目

4.  **UI组件**

    - 在webview-ui/src/components/settings/中创建或更新组件
    - 添加适当的滑块/输入控件，并设置min/max/step值
    - 确保props正确传递给SettingsView.tsx中的组件
    - 更新组件的props接口以包含新设置

5.  **翻译**

    - 在webview-ui/src/i18n/locales/en/settings.json中添加标签和描述
    - 更新所有其他语言
    - 如果任何语言内容发生变化，请将所有其他语言与该变化同步
    - 翻译必须在"translation"模式下执行，因此为此目的更改模式

6.  **状态管理**

    - 在SettingsView.tsx中将项目添加到解构中
    - 在SettingsView.tsx中将项目添加到handleSubmit函数
    - 在ClineProvider.ts中将项目添加到getStateToPostToWebview
    - 在ClineProvider.ts中将项目添加到getState，并设置适当的默认值
    - 在ClineProvider.ts的resolveWebviewView中将项目添加到初始化

7.  **消息处理**

    - 在webviewMessageHandler.ts中为该项目添加一个case

8.  **特定实现逻辑**

    - 实现由该设置触发的任何特定功能行为
    - 示例：
        - 终端设置的环境变量
        - 提供者设置的API配置更改
        - 显示设置的UI行为修改

9.  **测试**

    - 在适当的测试文件中为新设置添加测试用例
    - 验证设置持久性和状态更新

10. **确保设置在重新加载后持续存在**

    要确保设置在应用程序重新加载后持续存在，必须正确配置几个关键组件：

    1. **ExtensionStateContextProvider中的初始状态**：

        - 在useState调用中将设置添加到初始状态
        - 示例：
            ```typescript
            const [state, setState] = useState<ExtensionState>({
            	// 现有设置...
            	newSetting: false, // 新设置的默认值
            })
            ``` 

    2. **ClineProvider中的状态加载**：

        - 在getState方法中添加设置以从存储中加载
        - 示例：
            ```typescript
            return {
            	// 现有设置...
            	newSetting: stateValues.newSetting ?? false,
            }
            ```

    3. **resolveWebviewView中的状态初始化**：

        - 在resolveWebviewView中将设置添加到初始化
        - 示例：
            ```typescript
            this.getState().then(
            	({
            		// 现有设置...
            		newSetting,
            	}) => {
            		// 使用其存储值或默认值初始化设置
            		FeatureClass.setNewSetting(newSetting ?? false)
            	},
            )
            ```

    4. **状态传输到Webview**：

        - 将设置添加到getStateToPostToWebview方法
        - 示例：
            ```typescript
            return {
            	// 现有设置...
            	newSetting: newSetting ?? false,
            }
            ```

    5. **ExtensionStateContext中的Setter方法**：
        - 将setter方法添加到contextValue对象
        - 示例：
            ```typescript
            const contextValue: ExtensionStateContextType = {
            	// 现有属性和方法...
            	setNewSetting: (value) => setState((prevState) => ({ ...prevState, newSetting: value })),
            }
            ```

11. **调试设置持久性问题**

        如果设置在重新加载后不持久，请检查以下内容：

        1. **完整持久性链**：

            - 验证设置是否添加到所有必需位置：
                - schemas/index.ts中的globalSettingsSchema和globalSettingsRecord
                - ExtensionStateContextProvider中的初始状态
                - ClineProvider.ts中的getState方法
                - ClineProvider.ts中的getStateToPostToWebview方法
                - ClineProvider.ts中的resolveWebviewView方法（如果是特定功能）
            - 此链中任何部分的中断都可能阻止持久性

        2. **默认值一致性**：

            - 确保默认值在所有位置保持一致
            - 不一致的默认值可能导致意外行为

        3. **消息处理**：

            - 确认webviewMessageHandler.ts有设置的case
            - 验证消息类型与从UI发送的内容匹配

        4. **UI集成**：

            - 检查设置是否包含在SettingsView.tsx的handleSubmit函数中
            - 确保UI组件正确更新状态

        5. **类型定义**：

            - 验证设置在所有相关接口中都正确输入
            - 检查不同文件中属性名称的拼写错误

        6. **存储机制**：
            - 对于复杂设置，确保正确序列化/反序列化
            - 检查设置是否正确存储在VSCode的globalState中

        这些检查有助于识别和解决设置持久性的常见问题。

12. **高级故障排除：完整的设置持久性链**

设置持久性需要在多个组件之间进行完整的状态管理链。理解这个链对于人类和AI有效排除持久性问题至关重要：

1. **模式定义（入口点）**：

    - 设置必须在`globalSettingsSchema`和`globalSettingsRecord`中正确定义
    - 枚举值应使用适当的zod模式：`z.enum(["value1", "value2"])`
    - 示例：

        ```typescript
        // 在schemas/index.ts中
        export const globalSettingsSchema = z.object({
        	// 现有设置...
        	commandRiskLevel: z.enum(["readOnly", "reversibleChanges", "complexChanges"]).optional(),
        })

        const globalSettingsRecord: GlobalSettingsRecord = {
        	// 现有设置...
        	commandRiskLevel: undefined,
        }
        ```

2. **UI组件（用户交互）**：

    - 必须与其他类似设置使用一致的组件（Select vs. select）
    - 必须使用`setCachedStateField`进行状态更新，而不是直接设置状态
    - 必须通过`vscode.postMessage`生成正确的消息类型
    - 示例：
        ```tsx
        // 在设置组件中
        <Select value={commandRiskLevel} onValueChange={(value) => setCachedStateField("commandRiskLevel", value)}>
        	<SelectTrigger className="w-full">
        		<SelectValue placeholder={t("settings:common.select")} />
        	</SelectTrigger>
        	<SelectContent>
        		<SelectGroup>
        			<SelectItem value="readOnly">{t("label.readOnly")}</SelectItem>
        			{/* 其他选项... */}
        		</SelectGroup>
        	</SelectContent>
        </Select>
        ```

3. **消息处理程序（状态保存）**：

    - 必须在`webviewMessageHandler.ts`中使用正确的消息类型
    - 必须使用`updateGlobalState`并具有正确类型的值
    - 更新后必须调用`postStateToWebview`
    - 示例：
        ```typescript
        // 在webviewMessageHandler.ts中
        case "commandRiskLevel":
          await updateGlobalState(
            "commandRiskLevel",
            (message.text ?? "readOnly") as "readOnly" | "reversibleChanges" | "complexChanges"
          )
          await provider.postStateToWebview()
          break
        ```

4. **状态检索（读取状态）**：

    - 在`getState`中，必须从stateValues中正确检索状态
    - 在`getStateToPostToWebview`中，设置必须在解构参数中
    - 设置必须包含在返回值中
    - 需要时使用`contextProxy.getGlobalState`直接访问
    - 示例：

        ```typescript
        // 在ClineProvider.ts getStateToPostToWebview中
        const {
        	// 其他状态属性...
        	commandRiskLevel,
        } = await this.getState()

        return {
        	// 其他状态属性...
        	commandRiskLevel: commandRiskLevel ?? "readOnly",
        }
        ```

5. **调试策略**：

    - **跟踪状态流**：观察设置在链中每个步骤的值
    - **类型安全**：确保整个链中使用相同的类型
    - **组件一致性**：使用与其他正常工作的设置相同的模式
    - **检查返回值**：确保设置包含在所有返回对象中
    - **状态与配置**：了解何时使用状态与VSCode配置

6. **常见陷阱**：
    - **类型不匹配**：在需要枚举的地方使用字符串
    - **链断裂**：返回对象中缺少设置
    - **UI不一致**：使用不同的组件模式
    - **默认值问题**：组件之间的默认值不一致
    - **缺少模式**：未添加到模式或记录定义

请记住：此链中任何点的中断都可能导致持久性失败。在排除故障时，系统地检查链中的每个环节，以确定问题发生的位置。 