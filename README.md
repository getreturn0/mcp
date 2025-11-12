# @return-0/mcp-server

MCP (Model Context Protocol) server for [return0](https://getreturn0.com) - a tool for debugging production applications in real-time.

## About return0

return0 enables developers to debug production Node.js applications in real-time. It allows you to monitor and troubleshoot your applications by connecting to live variables, observing execution flow, and understanding runtime behavior directly within the Cursor IDE. This is especially powerful for debugging production applications built with Next.js and deployed on platforms like Vercel, where traditional debugging methods can be challenging.

- **Website**: [getreturn0.com](https://getreturn0.com)
- **Live Demo**: [getreturn0.com/livedemo](https://getreturn0.com/livedemo)
- **Documentation**: [getreturn0.com/docs](https://getreturn0.com/docs)

## Features

- **Real-time Production Debugging**: Debug production applications in real-time
- **Live Variable Monitoring**: Connect to live variables in running Node.js applications and observe their values in real-time
- **Execution Flow Observation**: Monitor execution flow and understand runtime behavior directly in your IDE
- **AST Analysis**: Automatically corrects line numbers using TypeScript AST analysis for accurate variable location
- **Cursor IDE Integration**: Seamlessly integrates with Cursor IDE through MCP (Model Context Protocol)
- **Next.js & Vercel Support**: Perfect for debugging Next.js applications deployed on Vercel and other remote platforms

## Configuration in Cursor

To use this MCP server with Cursor IDE, you need to configure it in your Cursor settings. First, you'll need to get your return0 API key.

### Getting Your API Key

To get your return0 API key, visit the [return0 documentation](https://getreturn0.com/docs). The documentation will guide you through the process of obtaining your API key.

Once you have your API key, you can configure the MCP server in one of two ways:

### Option 1: One-Click Installation

Click the button below to automatically install and configure the return0 MCP server in Cursor:

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-light.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=return0&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkByZXR1cm4tMC9tY3Atc2VydmVyIl0sImVudiI6eyJSRVRVUk4wX0FQSV9LRVkiOiIifX0=)

This will automatically configure the MCP server. **Note:** You'll need to add your return0 API key to the configuration after installation. See the [Getting Your API Key](#getting-your-api-key) section above for instructions on obtaining your API key, and the manual configuration section below for details on how to add it.

### Option 2: Manual Configuration

If you prefer to configure manually, follow these steps in Cursor IDE:

1. Open Cursor IDE
2. Go to **Settings** (or **Preferences** on macOS):
   - Click the gear icon (⚙️) in the bottom left corner, or
   - Use the keyboard shortcut: `Ctrl+,` (Windows/Linux) or `Cmd+,` (macOS)
3. In the settings search bar, type "MCP" or "Model Context Protocol"
4. Click on **MCP Servers** or navigate to the MCP configuration section
5. Click **Add Server** or the **+** button to add a new MCP server
6. Enter the following configuration:
   - **Name**: `return0`
   - **Command**: `npx`
   - **Args**: `-y`, `@return-0/mcp-server`
   - **Environment Variables**: Add `RETURN0_API_KEY` with your API key as the value
7. Click **Save** or **Apply** to save the configuration

The configuration should look like this in your `mcp.json` file:

```json
{
  "mcpServers": {
    "return0": {
      "command": "npx",
      "args": ["-y", "@return-0/mcp-server"],
      "env": {
        "RETURN0_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Note:** Replace `"your-api-key-here"` with your actual return0 API key. If you don't have an API key yet, see the [Getting Your API Key](#getting-your-api-key) section above for instructions, or you can use `"demo"` for testing purposes. The MCP server will be automatically installed via npx when Cursor starts.

## Usage

This MCP server provides a `variable_extractor` tool that can be used by MCP-compatible clients.

### Tool: `variable_extractor`

Extracts the runtime value, type, and timestamp of variables from production code.

**Input Schema:**
```typescript
{
  files: Array<{
    fileName: string;        // Full absolute path to the file
    variables: Array<{
      name: string;          // Variable name to extract
      lineNumber: number;    // Line number where variable is defined
    }>
  }>
}
```

**Example:**
```json
{
  "files": [
    {
      "fileName": "/path/to/your/file.ts",
      "variables": [
        {
          "name": "userData",
          "lineNumber": 42
        }
      ]
    }
  ]
}
```

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run the server in development mode with tsx
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:publish` - Test the package publish workflow

## How It Works

1. The MCP server receives requests to extract runtime variable values from production code
2. It reads the source files from the local filesystem
3. Uses TypeScript AST analysis to correct line numbers for accurate variable location
4. Connects to the running production application to retrieve live variable values
5. Returns the corrected variable extraction data with real-time runtime values, types, and timestamps

## License

See [LICENSE](LICENSE) file for details.

## Author

return0

## Links

- [Website](https://getreturn0.com)
- [Live Demo](https://getreturn0.com/livedemo)
- [Documentation](https://getreturn0.com/docs)

