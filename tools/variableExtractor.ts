import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const variableExtractorTool: Tool = {
  name: "variable_extractor",
  description: "Extract the runtime value, type, and timestamp of variables from production code. This tool reads live variable values from running applications, providing real-time insights into variable states during execution. Very helpful for debugging remote applications, like when hosted on Vercel and similar platforms.",
  inputSchema: {
    type: "object",
    properties: {
      files: {
        type: "array",
        description: "Array of files containing variables to extract",
        items: {
          type: "object",
          properties: {
            fileName: {
              type: "string",
              description: "The full absolute path to the file"
            },
            variables: {
              type: "array",
              description: "Array of variables to extract from this file",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the variable to extract"
                  },
                  lineNumber: {
                    type: "number",
                    description: "The line number where the variable is defined"
                  }
                },
                required: ["name", "lineNumber"]
              }
            }
          },
          required: ["fileName", "variables"]
        }
      }
    },
    required: ["files"]
  },
};
