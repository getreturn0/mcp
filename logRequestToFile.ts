import * as fs from "fs/promises";
import * as path from "path";

// Working directory env variable Cursor sets that we can access.
// __dirname doesnt work, it's undefined.
export const workspaceFolderPath = process.env.WORKSPACE_FOLDER_PATHS ?? "";

// Function to log requests to the variable-extractor endpoint
export const logRequestToFile = async (requestData: any, endpoint: string): Promise<void> => {
  // Only log if RETURN0_LOGGING environment variable is set
  if (!process.env.RETURN0_LOGGING) {
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      endpoint,
      request: requestData,
      headers: {
        "Content-Type": "application/json",
        "api-key": "demo",
        "github-url": "https://github.com/Amir-K/ComplexAPI",
      },
      dirname: workspaceFolderPath,
      processCwd: process.cwd(),
    };

    const logContent = JSON.stringify(logEntry, null, 2) + "\n---\n";

    // Create logs directory if it doesn't exist (within the repository)
    const logsDir = path.join(workspaceFolderPath, "logs", "localmcp");
    await fs.mkdir(logsDir, { recursive: true });

    // Append to the log file
    const logFilePath = path.join(logsDir, "variable-extractor-requests.log");
    await fs.appendFile(logFilePath, logContent, "utf-8");

    console.log(`Request logged to: ${logFilePath}`);
  } catch (error) {
    console.warn("Failed to log request:", error);
  }
};
