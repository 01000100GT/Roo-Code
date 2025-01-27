const assert = require("assert")
const vscode = require("vscode")
const path = require("path")
const fs = require("fs")
const dotenv = require("dotenv")

// Load test environment variables from root directory
const testEnvPath = path.join(__dirname, "..", "..", ".test_env")
dotenv.config({ path: testEnvPath })

suite("Roo Code Extension Test Suite", () => {
	vscode.window.showInformationMessage("Starting Roo Code extension tests.")

	test("Extension should be present", () => {
		const extension = vscode.extensions.getExtension("RooVeterinaryInc.roo-cline")
		assert.notStrictEqual(extension, undefined)
	})

	test("Extension should activate", async () => {
		const extension = vscode.extensions.getExtension("RooVeterinaryInc.roo-cline")
		if (!extension) {
			assert.fail("Extension not found")
		}
		await extension.activate()
		assert.strictEqual(extension.isActive, true)
	})

	test("OpenRouter API key and models should be configured correctly", function (done) {
		// @ts-ignore
		this.timeout(60000) // Increase timeout to 60s for network requests
		;(async () => {
			try {
				// Get extension instance
				const extension = vscode.extensions.getExtension("RooVeterinaryInc.roo-cline")
				if (!extension) {
					done(new Error("Extension not found"))
					return
				}

				// Verify API key is set and valid
				const apiKey = process.env.OPENROUTER_API_KEY
				if (!apiKey) {
					done(new Error("OPENROUTER_API_KEY environment variable is not set"))
					return
				}
				if (!apiKey.startsWith("sk-or-v1-")) {
					done(new Error("OpenRouter API key should have correct format"))
					return
				}

				// Activate extension and get provider
				const api = await extension.activate()
				if (!api) {
					done(new Error("Extension API not found"))
					return
				}

				// Get the provider from the extension's exports
				const provider = api.sidebarProvider
				if (!provider) {
					done(new Error("Provider not found"))
					return
				}

				// Set up the API configuration
				await provider.updateGlobalState("apiProvider", "openrouter")
				await provider.storeSecret("openRouterApiKey", apiKey)

				// Set up timeout to fail test if models don't load
				const timeout = setTimeout(() => {
					done(new Error("Timeout waiting for models to load"))
				}, 30000)

				// Wait for models to be loaded
				const checkModels = setInterval(async () => {
					try {
						const models = await provider.readOpenRouterModels()
						if (!models) {
							return
						}

						clearInterval(checkModels)
						clearTimeout(timeout)

						// Verify expected Claude models are available
						const expectedModels = [
							"anthropic/claude-3.5-sonnet:beta",
							"anthropic/claude-3-sonnet:beta",
							"anthropic/claude-3.5-sonnet",
							"anthropic/claude-3.5-sonnet-20240620",
							"anthropic/claude-3.5-sonnet-20240620:beta",
							"anthropic/claude-3.5-haiku:beta",
						]

						for (const modelId of expectedModels) {
							assert.strictEqual(modelId in models, true, `Model ${modelId} should be available`)
						}

						done()
					} catch (error) {
						clearInterval(checkModels)
						clearTimeout(timeout)
						done(error)
					}
				}, 1000)

				// Trigger model loading
				await provider.refreshOpenRouterModels()
			} catch (error) {
				done(error)
			}
		})()
	})

	test("Commands should be registered", async () => {
		const commands = await vscode.commands.getCommands(true)
		console.log(
			"Available commands:",
			// @ts-ignore
			commands.filter((cmd) => cmd.startsWith("roo-")),
		)

		// Test core commands are registered
		const expectedCommands = [
			"roo-cline.plusButtonClicked",
			"roo-cline.mcpButtonClicked",
			"roo-cline.promptsButtonClicked",
			"roo-cline.historyButtonClicked",
			"roo-cline.popoutButtonClicked",
			"roo-cline.settingsButtonClicked",
			"roo-cline.openInNewTab",
		]

		for (const cmd of expectedCommands) {
			assert.strictEqual(commands.includes(cmd), true, `Command ${cmd} should be registered`)
		}
	})

	test("Views should be registered", () => {
		const view = vscode.window.createWebviewPanel(
			"roo-cline.SidebarProvider",
			"Roo Code",
			vscode.ViewColumn.One,
			{},
		)
		assert.notStrictEqual(view, undefined)
		view.dispose()
	})

	test("Should handle prompt and response correctly", async function () {
		// @ts-ignore
		this.timeout(120000) // Increase timeout for API request

		const timeout = 60000
		const interval = 1000

		// Get extension instance
		const extension = await vscode.extensions.getExtension("RooVeterinaryInc.roo-cline")
		if (!extension) {
			assert.fail("Extension not found")
			return
		}

		// Activate extension and get API
		const api = await extension.activate()
		if (!api) {
			assert.fail("Extension API not found")
			return
		}

		// Get provider
		const provider = await api.sidebarProvider
		if (!provider) {
			assert.fail("Provider not found")
			return
		}

		// Set up API configuration
		await provider.updateGlobalState("apiProvider", "openrouter")
		await provider.updateGlobalState("openRouterModelId", "anthropic/claude-3.5-sonnet")
		const apiKey = process.env.OPENROUTER_API_KEY
		if (!apiKey) {
			assert.fail("OPENROUTER_API_KEY environment variable is not set")
			return
		}
		await provider.storeSecret("openRouterApiKey", apiKey)

		// Create webview panel with development options
		const extensionUri = extension.extensionUri
		const panel = vscode.window.createWebviewPanel("roo-cline.SidebarProvider", "Roo Code", vscode.ViewColumn.One, {
			enableScripts: true,
			enableCommandUris: true,
			retainContextWhenHidden: true,
			localResourceRoots: [extensionUri],
		})

		try {
			// Initialize webview with development context
			panel.webview.options = {
				enableScripts: true,
				enableCommandUris: true,
				localResourceRoots: [extensionUri],
			}

			// Initialize provider with panel
			await provider.resolveWebviewView(panel)
			// Set up message tracking
			let webviewReady = false
			let messagesReceived = false
			const originalPostMessage = await provider.postMessageToWebview.bind(provider)
			// @ts-ignore
			provider.postMessageToWebview = async function (message) {
				console.log("Posting message:", message)
				if (message.type === "state") {
					webviewReady = true
					//console.log("Webview state received:", message)
					if (message.state?.codeMessages?.length > 0) {
						messagesReceived = true
						console.log("Messages in state:", message.state.codeMessages)
					}
				}
				await originalPostMessage(message)
			}

			// Wait for webview to launch and receive initial state
			let startTime = Date.now()
			while (Date.now() - startTime < timeout) {
				if (webviewReady) {
					// Wait an additional second for webview to fully initialize
					await new Promise((resolve) => setTimeout(resolve, 1000))
					break
				}
				await new Promise((resolve) => setTimeout(resolve, interval))
			}

			if (!webviewReady) {
				console.log("Timeout waiting for webview to be ready: could be running in GHA")
			}

			// Send webviewDidLaunch to initialize chat
			await provider.postMessageToWebview({ type: "webviewDidLaunch" })
			console.log("Sent webviewDidLaunch")

			// Wait for webview to fully initialize
			await new Promise((resolve) => setTimeout(resolve, 2000))

			// Restore original postMessage
			provider.postMessageToWebview = originalPostMessage

			// Wait for OpenRouter models to be fully loaded
			startTime = Date.now()
			while (Date.now() - startTime < timeout) {
				const models = await provider.readOpenRouterModels()
				if (models && Object.keys(models).length > 0) {
					//console.log("OpenRouter models loaded")
					break
				}
				await new Promise((resolve) => setTimeout(resolve, interval))
			}

			// Send prompt
			const prompt = "Hello world, what is your name?"
			console.log("Sending prompt:", prompt)

			// Start task
			try {
				await api.startNewTask(prompt)
				console.log("Task started")
			} catch (error) {
				console.error("Error starting task:", error)
				throw error
			}

			// Wait for messages to be processed
			startTime = Date.now()
			let responseReceived = false
			while (Date.now() - startTime < timeout) {
				console.log("State:", await provider.getState())
				console.log("Cline:", provider.cline?.clineMessages)
				// Check provider.clineMessages
				const messages = provider.clineMessages
				if (messages && messages.length > 0) {
					console.log("Provider messages:", JSON.stringify(messages, null, 2))
					const hasResponse = messages.some(
						// @ts-ignore
						(m) => m.type === "say" && m.text && m.text.toLowerCase().includes("roo"),
					)
					if (hasResponse) {
						console.log('Found response containing "Roo" in provider messages')
						responseReceived = true
						break
					}
				}

				//Check provider.cline.clineMessages
				const clineMessages = provider.cline?.clineMessages
				if (clineMessages && clineMessages.length > 0) {
					console.log("Cline messages:", JSON.stringify(clineMessages, null, 2))
					const hasResponse = clineMessages.some(
						// @ts-ignore
						(m) => m.type === "say" && m.text && m.text.toLowerCase().includes("roo"),
					)
					if (hasResponse) {
						console.log('Found response containing "Roo" in cline messages')
						responseReceived = true
						break
					}
				}

				await new Promise((resolve) => setTimeout(resolve, interval))
				console.log("Waiting for response...")
			}

			if (!responseReceived) {
				console.log("Final provider state:", await provider.getState())
				throw new Error("Did not receive any response")
			}
		} finally {
			panel.dispose()
		}
	})
})
