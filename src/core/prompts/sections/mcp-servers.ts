import { DiffStrategy } from "../../diff/DiffStrategy"
import { McpHub } from "../../../services/mcp/McpHub"

export async function getMcpServersSection(
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	enableMcpServerCreation?: boolean,
): Promise<string> {
	if (!mcpHub) {
		return ""
	}

	const connectedServers =
		mcpHub.getServers().length > 0
			? `${mcpHub
					.getServers()
					.filter((server) => server.status === "connected")
					.map((server) => {
						const tools = server.tools
							?.map((tool) => {
								const schemaStr = tool.inputSchema
									? `    Input Schema:
    ${JSON.stringify(tool.inputSchema, null, 2).split("\n").join("\n    ")}`
									: ""

								return `- ${tool.name}: ${tool.description}\n${schemaStr}`
							})
							.join("\n\n")

						const templates = server.resourceTemplates
							?.map((template) => `- ${template.uriTemplate} (${template.name}): ${template.description}`)
							.join("\n")

						const resources = server.resources
							?.map((resource) => `- ${resource.uri} (${resource.name}): ${resource.description}`)
							.join("\n")

						const config = JSON.parse(server.config)

						return (
							`## ${server.name} (\`${config.command}${config.args && Array.isArray(config.args) ? ` ${config.args.join(" ")}` : ""}\`)` +
							(tools ? `\n\n### Available Tools\n${tools}` : "") +
							(templates ? `\n\n### Resource Templates\n${templates}` : "") +
							(resources ? `\n\n### Direct Resources\n${resources}` : "")
						)
					})
					.join("\n\n")}`
			: "(No MCP servers currently connected)"

	const baseSection = `MCP 服务器

模型上下文协议（MCP）实现了系统与本地运行的MCP服务器之间的通信，这些服务器提供额外的工具和资源来扩展你的能力。

# 已连接的MCP服务器

当服务器连接后，你可以通过\`use_mcp_tool\`工具使用服务器的工具，并通过\`access_mcp_resource\`工具访问服务器的资源。

${connectedServers}`

	if (!enableMcpServerCreation) {
		return baseSection
	}

	return (
		baseSection +
		`

## 创建MCP服务器

用户可能会要求你"添加一个工具"来执行某些功能，换句话说，创建一个MCP服务器，提供可能连接到外部API的工具和资源。你有能力创建MCP服务器并将其添加到配置文件中，然后通过\`use_mcp_tool\`和\`access_mcp_resource\`使用这些工具和资源。

创建MCP服务器时，重要的是要理解它们在非交互式环境中运行。服务器无法在运行时启动OAuth流程、打开浏览器窗口或提示用户输入。所有凭证和认证令牌必须通过MCP设置配置中的环境变量预先提供。例如，Spotify的API使用OAuth获取用户的刷新令牌，但MCP服务器无法启动此流程。虽然你可以指导用户获取应用程序客户端ID和密钥，但你可能需要创建一个单次设置脚本（如get-refresh-token.js）来捕获并记录最后一个关键部分：用户的刷新令牌（即你可以使用execute_command运行脚本，该脚本会打开浏览器进行认证，然后记录刷新令牌，以便你可以在命令输出中看到它，并在MCP设置配置中使用）。

除非用户另有指定，新的MCP服务器应该创建在：${await mcpHub.getMcpServersPath()}

### MCP服务器示例

例如，如果用户想让你能够检索天气信息，你可以创建一个使用OpenWeather API获取天气信息的MCP服务器，将其添加到MCP设置配置文件中，然后你会注意到系统提示中现在有了新的工具和资源，你可以使用这些工具和资源向用户展示你的新能力。

以下示例演示了如何构建提供天气数据功能的MCP服务器。虽然此示例展示了如何实现资源、资源模板和工具，但在实践中，你应该优先使用工具，因为它们更灵活，可以处理动态参数。资源和资源模板实现主要是为了演示不同的MCP功能，但实际的天气服务器可能只会公开用于获取天气数据的工具。（以下步骤适用于macOS）

1. 使用 \`create-typescript-server\` 工具在默认的 MCP 服务器目录中创建一个新项目：
\`\`\`bash
cd ${await mcpHub.getMcpServersPath()}
npx @modelcontextprotocol/create-server weather-server
cd weather-server
# Install dependencies
npm install axios
\`\`\`

This will create a new project with the following structure:

\`\`\`
weather-server/
  ├── package.json
      {
        ...
        "type": "module", // added by default, uses ES module syntax (import/export) rather than CommonJS (require/module.exports) (Important to know if you create additional scripts in this server repository like a get-refresh-token.js script)
        "scripts": {
          "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
          ...
        }
        ...
      }
  ├── tsconfig.json
  └── src/
      └── weather-server/
          └── index.ts      # Main server implementation
\`\`\`

2. 用以下内容替换 \`src/index.ts\`:

\`\`\`typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY; // provided by MCP config
if (!API_KEY) {
  throw new Error('OPENWEATHER_API_KEY environment variable is required');
}

interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: [{ description: string }];
  wind: { speed: number };
  dt_txt?: string;
}

const isValidForecastArgs = (
  args: any
): args is { city: string; days?: number } =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.city === 'string' &&
  (args.days === undefined || typeof args.days === 'number');

class WeatherServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'example-weather-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'http://api.openweathermap.org/data/2.5',
      params: {
        appid: API_KEY,
        units: 'metric',
      },
    });

    this.setupResourceHandlers();
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

// MCP 资源表示 MCP 服务器希望提供给客户端的任何 UTF-8 编码数据，例如数据库记录、API 响应、日志文件等。服务器通过静态 URI 定义直接资源，或通过遵循格式 \`[protocol]://[host]/[path]\` 的 URI 模板定义动态资源。
  private setupResourceHandlers() {
    // For static resources, servers can expose a list of resources:
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        // This is a poor example since you could use the resource template to get the same information but this demonstrates how to define a static resource
        {
          uri: \`weather://San Francisco/current\`, // Unique identifier for San Francisco weather resource
          name: \`Current weather in San Francisco\`, // Human-readable name
          mimeType: 'application/json', // Optional MIME type
          // Optional description
          description:
            'Real-time weather data for San Francisco including temperature, conditions, humidity, and wind speed',
        },
      ],
    }));

// 对于动态资源，服务器可以公开资源模板：
    this.server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async () => ({
        resourceTemplates: [
          {
            uriTemplate: 'weather://{city}/current', // URI template (RFC 6570)
            name: 'Current weather for a given city', // Human-readable name
            mimeType: 'application/json', // Optional MIME type
            description: 'Real-time weather data for a specified city', // Optional description
          },
        ],
      })
    );

    // ReadResourceRequestSchema 用于静态资源和动态资源模板
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const match = request.params.uri.match(
          /^weather:\/\/([^/]+)\/current$/
        );
        if (!match) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            \`Invalid URI format: \${request.params.uri}\`
          );
        }
        const city = decodeURIComponent(match[1]);

        try {
          const response = await this.axiosInstance.get(
            'weather', // current weather
            {
              params: { q: city },
            }
          );

          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    temperature: response.data.main.temp,
                    conditions: response.data.weather[0].description,
                    humidity: response.data.main.humidity,
                    wind_speed: response.data.wind.speed,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new McpError(
              ErrorCode.InternalError,
              \`Weather API error: \${
                error.response?.data.message ?? error.message
              }\`
            );
          }
          throw error;
        }
      }
    );
  }

  /* MCP 工具使服务器能够向系统公开可执行功能。通过这些工具，你可以与外部系统交互、执行计算以及在现实世界中采取行动。
   * - 与资源类似，工具通过唯一名称标识，并可以包含描述以指导其使用。然而，与资源不同，工具代表动态操作，可以修改状态或与外部系统交互。
   * - 虽然资源和工具相似，但在可能的情况下，你应该优先创建工具而不是资源，因为它们提供了更多的灵活性。
   */
  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_forecast', // Unique identifier
          description: 'Get weather forecast for a city', // Human-readable description
          inputSchema: {
            // JSON Schema for parameters
            type: 'object',
            properties: {
              city: {
                type: 'string',
                description: 'City name',
              },
              days: {
                type: 'number',
                description: 'Number of days (1-5)',
                minimum: 1,
                maximum: 5,
              },
            },
            required: ['city'], // Array of required property names
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'get_forecast') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          \`Unknown tool: \${request.params.name}\`
        );
      }

      if (!isValidForecastArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid forecast arguments'
        );
      }

      const city = request.params.arguments.city;
      const days = Math.min(request.params.arguments.days || 3, 5);

      try {
        const response = await this.axiosInstance.get<{
          list: OpenWeatherResponse[];
        }>('forecast', {
          params: {
            q: city,
            cnt: days * 8,
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data.list, null, 2),
            },
          ],
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [
              {
                type: 'text',
                text: \`Weather API error: \${
                  error.response?.data.message ?? error.message
                }\`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Weather MCP server running on stdio');
  }
}

const server = new WeatherServer();
server.run().catch(console.error);
\`\`\`

（请记住：这只是一个示例——你可以使用不同的依赖项，将实现拆分为多个文件等。）

3. 构建并编译可执行的 JavaScript 文件

\`\`\`bash
npm run build
\`\`\`

4. 每当你需要一个环境变量，比如用于配置MCP服务器的API密钥时，引导用户获取该密钥的过程。例如，他们可能需要创建一个账户并访问开发者控制台以生成密钥。提供分步说明和URL，以便用户轻松获取必要的信息。然后使用ask_followup_question工具询问用户密钥，在这种情况下是OpenWeather API密钥。

5. 通过将MCP服务器配置添加到位于 '${await mcpHub.getMcpSettingsFilePath()}' 的设置文件中来安装MCP服务器。设置文件中可能已经配置了其他MCP服务器，因此你需要先读取它，然后将你的新服务器添加到现有的 \`mcpServers\` 对象中。

重要提示：无论在MCP设置文件中看到什么，你创建的任何新MCP服务器都必须默认设置为disabled=false和alwaysAllow=[]。

\`\`\`json
{
  "mcpServers": {
    ...,
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-server/build/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "user-provided-api-key"
      }
    },
  }
}
\`\`\`

（注意：用户可能还会要求你将MCP服务器安装到Claude桌面应用程序中，在这种情况下，你需要读取并修改macOS上的\`~/Library/Application\ Support/Claude/claude_desktop_config.json\`文件。例如，它遵循与顶级\`mcpServers\`对象相同的格式。）

6. 在你编辑完MCP设置配置文件后，系统将自动运行所有服务器，并在“已连接的MCP服务器”部分中展示可用的工具和资源。

7. 现在你可以访问这些新的工具和资源，你可以建议用户如何命令你调用它们——例如，随着这个新的天气工具的可用，你可以邀请用户询问“旧金山的天气怎么样？”

## 编辑MCP服务器

用户可能会要求添加工具或资源，这些工具或资源可能适合添加到现有的MCP服务器中（在上面的“已连接的MCP服务器”下列出：${
			mcpHub
				.getServers()
				.map((server) => server.name)
				.join(", ") || "(None running currently)"
		}，例如，如果它使用相同的API。这在你可以通过查看服务器参数中的文件路径来定位用户系统上的MCP服务器存储库时是可能的。然后，你可以使用list_files和read_file来探索存储库中的文件，并使用write_to_file${diffStrategy ? "或apply_diff" : ""}来修改文件。

然而，一些MCP服务器可能是从已安装的软件包运行的，而不是本地存储库，在这种情况下，创建一个新的MCP服务器可能更有意义。

# MCP服务器并非总是必要的

用户可能并不总是要求使用或创建MCP服务器。相反，他们可能提供可以用现有工具完成的任务。虽然使用MCP SDK来扩展你的能力可能很有用，但重要的是要理解这只是你可以完成的一种专门任务。只有当用户明确要求时（例如，“添加一个工具来...”），你才应该实现MCP服务器。

请记住：上面提供的MCP文档和示例是为了帮助你理解和使用现有的MCP服务器，或者在用户请求时创建新的MCP服务器。你已经可以访问工具和功能，这些工具和功能可以用来完成各种任务。`
	)
}
