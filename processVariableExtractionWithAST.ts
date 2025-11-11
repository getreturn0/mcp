import path from "path";
import ts from "typescript";
import * as fs from "fs/promises";

// Interface for corrected variable extraction
export interface CorrectedVariableExtraction {
  files: Array<{
    fileName: string;
    variables: Array<{
      name: string;
      lineNumber: number;
      originalLineNumber: number;
    }>;
  }>;
  errors?: Array<{
    fileName: string;
    error: string;
  }>;
}

// Function to read files from local file system
export const readFilesFromLocalFileSystem = async (fileNames: string[]): Promise<{
  fileContents: Record<string, string>;
  errors: Array<{ fileName: string; error: string }>;
}> => {
  const fileContents: Record<string, string> = {};
  const errors: Array<{ fileName: string; error: string }> = [];

  try {
    // Read each file from the local file system
    for (const fileName of fileNames) {
      try {
        // Check if fileName is already an absolute path
        // If it's absolute, use it directly; otherwise resolve relative to cwd
        const filePath = path.isAbsolute(fileName) 
          ? fileName 
          : path.resolve(process.cwd(), fileName);
        if (process.env.RETURN0_LOGGING) {
          console.log("Reading file:", filePath);
        }
        const content = await fs.readFile(filePath, "utf-8");
        fileContents[fileName] = content;
      } catch (error: any) {
        if (process.env.RETURN0_LOGGING) {
          console.warn(`File not found: ${fileName}`, error?.message);
        }
        errors.push({ fileName, error: error?.message });
      }
    }
  } catch (error: any) {
    if (process.env.RETURN0_LOGGING) {
      console.warn("Error reading files from local file system:", error);
    }
    errors.push({ fileName: "system", error: error?.message });
  }

  return { fileContents, errors };
};

// Function to correct line numbers using AST analysis
export const correctVariableExtractionWithAST = (
  variableExtraction: {
    files: Array<{ fileName: string; variables: Array<{ name: string; lineNumber: number }> }>;
  },
  fileContents: Record<string, string>
): CorrectedVariableExtraction => {
  const correctedFiles = variableExtraction.files.map((file) => {
    const fileContent = fileContents[file.fileName];
    if (!fileContent) {
      // If we can't read the file, return original data
      return {
        ...file,
        variables: file.variables.map((variable) => ({
          ...variable,
          originalLineNumber: variable.lineNumber,
        })),
      };
    }

    try {
      const sourceFile = ts.createSourceFile(file.fileName, fileContent, ts.ScriptTarget.Latest, true);

      const correctedVariables = file.variables.map((variable) => {
        // Find the best line number for each variable (like original implementation)
        const correctedLineNumber = findVariableDeclarationLine(
          sourceFile,
          variable.name,
          variable.lineNumber
        );

        // If no specific variable declarations found, try to find scope start (like original implementation)
        const scopeStartLine = findScopeStartLine(sourceFile, variable.lineNumber);
        const finalLineNumber = Math.max(correctedLineNumber, scopeStartLine);

        return {
          ...variable,
          lineNumber: finalLineNumber,
          originalLineNumber: variable.lineNumber,
        };
      });

      return {
        ...file,
        variables: correctedVariables,
      };
    } catch (error) {
      if (process.env.RETURN0_LOGGING) {
        console.warn(`Error parsing file ${file.fileName}:`, error);
      }
      return {
        ...file,
        variables: file.variables.map((variable) => ({
          ...variable,
          originalLineNumber: variable.lineNumber,
        })),
      };
    }
  });

  return { files: correctedFiles };
};

// Helper function to find variable declaration line number
const findVariableDeclarationLine = (
  sourceFile: ts.SourceFile,
  variableName: string,
  originalLineNumber: number
): number => {
  let correctedLineNumber = originalLineNumber;

  const findVariableDeclaration = (node: ts.Node): void => {
    // Check for variable declarations
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName) {
      const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      // For template literals, use the end of the template literal
      if (node.initializer) {
        if (
          ts.isTemplateExpression(node.initializer) ||
          ts.isNoSubstitutionTemplateLiteral(node.initializer)
        ) {
          const templateEndLine =
            sourceFile.getLineAndCharacterOfPosition(node.initializer.getEnd()).line + 1;
          correctedLineNumber = templateEndLine + 1; // Next line after template literal ends
        } else {
          // For any initializer, use the end of the initializer + 1
          const initializerEndLine =
            sourceFile.getLineAndCharacterOfPosition(node.initializer.getEnd()).line + 1;
          correctedLineNumber = initializerEndLine + 1; // Next line after initializer ends
        }
      } else {
        // Return the next line after the variable declaration (where the variable is actually usable)
        correctedLineNumber = lineNumber + 1;
      }
    }

    // Check for function parameters (like map callback parameters)
    if (ts.isParameter(node) && ts.isIdentifier(node.name) && node.name.text === variableName) {
      const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      // For parameters, the line number is already correct (parameter is available immediately)
      if (lineNumber >= originalLineNumber) {
        correctedLineNumber = originalLineNumber; // Keep original line for parameters
      }
    }

    node.forEachChild(findVariableDeclaration);
  };

  findVariableDeclaration(sourceFile);
  return correctedLineNumber;
};

// Helper function to find function/block scope start line (from original implementation)
const findScopeStartLine = (sourceFile: ts.SourceFile, originalLineNumber: number): number => {
  let scopeStartLine = originalLineNumber;

  const findScope = (node: ts.Node): void => {
    const nodeStart = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    const nodeEnd = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;

    // Check if the original line is within this node's scope
    if (originalLineNumber >= nodeStart && originalLineNumber <= nodeEnd) {
      // For function declarations, use the next line after the opening brace
      if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
        const body = node.body;
        if (body && ts.isBlock(body)) {
          const bodyStart = sourceFile.getLineAndCharacterOfPosition(body.getStart()).line + 1;
          if (bodyStart > originalLineNumber) {
            scopeStartLine = bodyStart + 1; // Next line after opening brace
          }
        }
      }
      // For block statements, use the next line after the opening brace
      else if (ts.isBlock(node)) {
        const blockStart = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        if (blockStart > originalLineNumber) {
          scopeStartLine = blockStart + 1; // Next line after opening brace
        }
      }
    }

    node.forEachChild(findScope);
  };

  findScope(sourceFile);
  return scopeStartLine;
};

// Function to process variable extraction with AST correction

export const processVariableExtractionWithAST = async (variableExtraction: {
  files: Array<{ fileName: string; variables: Array<{ name: string; lineNumber: number }> }>;
}): Promise<CorrectedVariableExtraction> => {
  try {
    // Collect unique file names
    const fileNames = [...new Set(variableExtraction.files.map((file) => file.fileName))];

    // Read files from local file system
    const { fileContents, errors } = await readFilesFromLocalFileSystem(fileNames);

    // Correct line numbers using AST analysis
    const correctedExtraction = correctVariableExtractionWithAST(variableExtraction, fileContents);
    
    // Include any file reading errors in the result
    if (errors.length > 0) {
      correctedExtraction.errors = errors;
    }

    return correctedExtraction;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (process.env.RETURN0_LOGGING) {
      console.warn("Failed to read files for AST correction:", error);
    }
    // Fallback to original data if file read fails, but include error information
    return {
      files: variableExtraction.files.map((file) => ({
        ...file,
        variables: file.variables.map((variable) => ({
          ...variable,
          originalLineNumber: variable.lineNumber,
        })),
      })),
      errors: [{ fileName: "system", error: errorMessage }],
    };
  }
};
