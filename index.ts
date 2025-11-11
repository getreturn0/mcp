import "reflect-metadata";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";

import { variableExtractorTool } from "./tools/variableExtractor.js";
import { handleVariableExtractorCase } from "./handleVariableExtractorCase.js";
import { workspaceFolderPath } from "./logRequestToFile.js";

// NOTE: Seems like npx can only be tested after publishing.
// Reason why it works now is because of 'bin' binding when doing npm global install.

// Define our hello world tool
const helloWorldTool: Tool = {
  name: "amirsworld",
  description: "Use this tool to extract runtime value of a variable in running code.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The variable name to extract the runtime value of",
      },
    },
    required: [],
  },
};

// Create the MCP server
const server = new Server(
  {
    name: "variable-extractor-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [/*helloWorldTool,*/ variableExtractorTool],
  };
});

// process.env.WORKSPACE_FOLDER_PATHS works. Give the working directory path when Cursor calls the tool.

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "amirsworld": {
      const variableName = args?.name || "World";
      return { 
        content: [
          {
            type: "text",
            text: `The runtime value of ${variableName} is ${variableName}. Working directory: ${
              workspaceFolderPath ?? "not set"
            }`,
          },
        ],
      };
    }

    case "variable_extractor": {
      return await handleVariableExtractorCase(args);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Create stdio transport and start the server
async function startServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP Server started with stdio transport");
}

// Start the server
startServer().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
