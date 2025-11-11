import "reflect-metadata";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { logRequestToFile } from "./logRequestToFile";
import { RetrieveVariableValuesActionDto } from "./dto/RetrieveVariableValuesActionDto";
import { processVariableExtractionWithAST } from "./processVariableExtractionWithAST";

// Determine the base host URL based on environment variable
const getBaseHost = (): string => {
  return process.env.RETURN0_USE_DEVHOST
    ? "http://localhost:7000"
    : "https://bugsorcontainerapp.livelybush-67f33f33.canadacentral.azurecontainerapps.io";
};

const getVariableExtractorEndpoint = (): string => {
  return `${getBaseHost()}/variable-extractor`;
};

// Utility function to remove workspace folder path prefix from file names
const removeWorkspacePrefix = (fileName: string): string => {
  const workspacePaths = process.env.WORKSPACE_FOLDER_PATHS;
  if (!workspacePaths) {
    // Normalize slashes to forward slashes
    return fileName.replace(/\\/g, "/");
  }

  // Normalize fileName to forward slashes for comparison
  let normalizedFileName = fileName.replace(/\\/g, "/");
  normalizedFileName = normalizedFileName.replace(/\/+/g, "/"); // Normalize double slashes

  // Split workspace paths by comma and trim whitespace
  const paths = workspacePaths.split(",").map((p) => {
    const trimmed = p.trim().replace(/\\/g, "/");
    return trimmed.replace(/\/+$/, ""); // Remove trailing slashes
  });

  // Find the first matching workspace path
  for (const workspacePath of paths) {
    const normalizedWorkspace = workspacePath.replace(/\/+$/, "");

    // Case-insensitive comparison
    if (normalizedFileName.toLowerCase().startsWith(normalizedWorkspace.toLowerCase())) {
      // Remove the workspace path prefix and any leading slash
      // We need to use the actual length of the normalizedFileName for substring
      const lowerFileName = normalizedFileName.toLowerCase();
      const lowerWorkspace = normalizedWorkspace.toLowerCase();
      const matchStart = lowerFileName.indexOf(lowerWorkspace);
      let relativePath = normalizedFileName.substring(matchStart + normalizedWorkspace.length);
      relativePath = relativePath.replace(/^\/+/, ""); // Remove leading slashes

      // Ensure result uses forward slashes only
      return relativePath.replace(/\/+/g, "/");
    }
  }

  // If no workspace prefix match, just normalize slashes
  return normalizedFileName.replace(/\/+/g, "/");
};

export async function handleVariableExtractorCase(args: any) {
  try {
    const dto = plainToClass(RetrieveVariableValuesActionDto, args);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      const errorMessages = validationErrors
        .map((error) => `${error.property}: ${Object.values(error.constraints || {}).join(", ")}`)
        .join("; ");

      return {
        content: [
          {
            type: "text",
            text: `Validation error: ${errorMessages}`,
          },
        ],
        isError: true,
      };
    }

    const apiKey = process.env.RETURN0_API_KEY;

    if (!apiKey) {
      return {
        content: [
          {
            type: "text",
            text: "RETURN0_API_KEY environment variable is not set",
          },
        ],
        isError: true,
      };
    }

    const correctedVariableExtraction = await processVariableExtractionWithAST(dto);

    // Check for file reading errors
    if (correctedVariableExtraction.errors && correctedVariableExtraction.errors.length > 0) {
      const errorMessages = correctedVariableExtraction.errors
        .map((error) => `File ${error.fileName}: ${error.error}`)
        .join("; ");

      return {
        content: [
          {
            type: "text",
            text: `File reading errors: ${errorMessages}`,
          },
        ],
        isError: true,
      };
    }

    // Normalize file names by removing workspace prefix before sending to endpoint
    const normalizedFiles = correctedVariableExtraction.files.map((file) => {
      const normalized = removeWorkspacePrefix(file.fileName);

      if (process.env.RETURN0_LOGGING) {
        console.log(`Normalizing file:
          Original: ${file.fileName}
          Workspace: ${process.env.WORKSPACE_FOLDER_PATHS}
          Normalized: ${normalized}`);
      }

      return {
        ...file,
        fileName: normalized,
      };
    });

    const correctedDto = {
      ...dto,
      files: normalizedFiles,
    };

    const endpoint = getVariableExtractorEndpoint();
    const timestamp = new Date().toISOString();

    const headers = {
      "Content-Type": "application/json",
      "api-key": apiKey,
      // "github-url": "https://github.com/Amir-K/ComplexAPI",
    };

    const logEntry = {
      timestamp,
      endpoint,
      request: correctedDto,
      headers,
      workspaceFolderPaths: process.env.WORKSPACE_FOLDER_PATHS ?? "not set",
      processCwd: process.cwd(),
    };

    if (process.env.RETURN0_LOGGING) {
      await logRequestToFile(correctedDto, endpoint);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(correctedDto),
    });

    const result = (await response.json()) as { message?: string; status?: string; data?: any };

    if (!response.ok) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${result.message || "Request failed"}`,
          },
        ],
        isError: true,
        debug: {
          logEntry,
        },
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
      debug: {
        logEntry,
      },
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        },
      ],
      isError: true,
    };
  }
}
