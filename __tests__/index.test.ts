import nock from "nock";
import { processVariableExtractionWithAST } from "../processVariableExtractionWithAST";
import { handleVariableExtractorCase } from "../handleVariableExtractorCase";

process.env.WORKSPACE_FOLDER_PATHS = `${__dirname}\\examplerepo`;
process.env.RETURN0_API_KEY = "demo";
process.env.RETURN0_USE_DEVHOST = "true"; // Use localhost:7000 for tests

describe("localmcp", () => {
  beforeEach(() => {
    // Clean up any existing interceptors
    nock.cleanAll();
  });

  afterEach(() => {
    // Ensure all interceptors were used
    if (!nock.isDone()) {
      const pending = nock.pendingMocks();
      nock.cleanAll();
      throw new Error(`Pending nock interceptors: ${pending.join(", ")}`);
    }
    nock.cleanAll();
  });

  it("should be defined", (done) => {
    expect(processVariableExtractionWithAST).toBeDefined();

    const fileName = `${__dirname}/examplerepo/app/api/balances/route.ts`;

    processVariableExtractionWithAST({
      files: [
        {
          fileName,
          variables: [{ name: "previousBalance", lineNumber: 14 }],
        },
      ],
    }).then((result) => {
      console.log(JSON.stringify(result, null, 2));
      done();
    });
  });

  it("should call the variable extractor endpoint correctly", async () => {
    // Mock the variable extractor endpoint
    const mockResponse = {
      message: "Variables extracted successfully",
      status: "success",
      data: {
        variables: [
          {
            name: "previousBalance",
            value: 1000,
            type: "number",
            lineNumber: 14,
            fileName: "app/api/balances/route.ts",
          },
        ],
      },
    };

    const scope = nock("http://localhost:7000")
      .post("/variable-extractor")
      .matchHeader("Content-Type", "application/json")
      .matchHeader("api-key", "demo")
      .reply(200, mockResponse);

    // Test data
    const fileName = `${__dirname}/examplerepo/app/api/balances/route.ts`;

    const requestBody = {
      files: [
        {
          fileName,
          variables: [{ name: "previousBalance", lineNumber: 14 }],
        },
      ],
    };

    // Make the actual HTTP request
    const response = await fetch("http://localhost:7000/variable-extractor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": "demo",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    console.log("result", JSON.stringify(result, null, 2));

    // Verify the response
    expect(response.status).toBe(200);
    expect(result).toEqual(mockResponse);

    // Verify that the endpoint was called with correct headers and body
    expect(scope.isDone()).toBe(true);
  });

  describe("handleVariableExtractorCase", () => {
    it("should handle the variable extractor case correctly", async () => {
      // Test cases with different path formats
      console.log(process.env.WORKSPACE_FOLDER_PATHS);

      const testCases = [
        {
          input: `${__dirname}/examplerepo/app/api/balances/route.ts`,
          description: "Forward slashes",
        },
        {
          input: `${__dirname}\\examplerepo\\app\\api\\balances\\route.ts`,
          description: "Backward slashes",
        },
        {
          input: `${__dirname}\\\\examplerepo\\\\app\\\\api\\\\balances\\\\route.ts`,
          description: "Double backslashes",
        },
        {
          input: `${__dirname}\\examplerepo/app\\api/balances\\route.ts`,
          description: "Mixed slashes",
        },
      ];

      const mockResponse = {
        message: "Variables extracted successfully",
        status: "success",
        data: {
          variables: [
            {
              name: "previousBalance",
              value: 1000,
              type: "number",
              lineNumber: 14,
            },
          ],
        },
      };

      // Run each test case
      for (const testCase of testCases) {
        // Mock the endpoint for each test
        const scope = nock("http://localhost:7000")
          .post("/variable-extractor", (body) => {
            // Assert that fileName is normalized to forward slashes
            expect(body.files[0].fileName).toBe("app/api/balances/route.ts");
            return true;
          })
          .matchHeader("Content-Type", "application/json")
          .matchHeader("api-key", "demo")
          .reply(200, mockResponse);

        // ACT
        const result = await handleVariableExtractorCase({
          files: [
            {
              fileName: testCase.input,
              variables: [{ name: "previousBalance", lineNumber: 14 }],
            },
          ],
        });

        // ASSERT
        expect(scope.isDone()).toBe(true);
        expect(result.content).toBeDefined();
        
        console.log(`✓ ${testCase.description}: ${testCase.input}`);
        console.log(`  Normalized to: app/api/balances/route.ts`);

        // Clean up for next iteration
        nock.cleanAll();
      }
    });

    it("should handle read file errors", async () => {
      // ARRANGE - Use a file path that doesn't exist to trigger file read error
      const fileName = `app/api/balances/route.ts`;

      // ACT - When file can't be read, function returns early with error (no HTTP call)
      const result = await handleVariableExtractorCase({
        files: [
          {
            fileName: fileName,
            variables: [{ name: "previousBalance", lineNumber: 14 }],
          },
        ],
      });

      // ASSERT - Should return error response without making HTTP request
      expect(result.isError).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain("File reading errors");
      console.log("result", JSON.stringify(result, null, 2));
    });

    it("should strip workspace prefix when WORKSPACE_FOLDER_PATHS matches file path", async () => {
      // ARRANGE - Simulate a different workspace path scenario
      const originalWorkspace = process.env.WORKSPACE_FOLDER_PATHS;
      
      // Set workspace to a different path with backslashes (simulating C:\Git\ComplexAPI)
      process.env.WORKSPACE_FOLDER_PATHS = "c:\\Git\\ComplexAPI";

      // Mock the endpoint
      const mockResponse = {
        message: "Variables extracted successfully",
        status: "success",
        data: {
          variables: [
            {
              name: "data",
              value: 123,
              type: "number",
              lineNumber: 10,
            },
          ],
        },
      };

      const scope = nock("http://localhost:7000")
        .post("/variable-extractor", (body) => {
          // Assert that fileName is normalized to remove workspace prefix
          expect(body.files[0].fileName).toBe("app/api/balances/route.ts");
          return true;
        })
        .matchHeader("Content-Type", "application/json")
        .matchHeader("api-key", "demo")
        .reply(200, mockResponse);

      // ACT - Pass in a full absolute path with backslashes
      const result = await handleVariableExtractorCase({
        files: [
          {
            fileName: "C:\\Git\\ComplexAPI\\app\\api\\balances\\route.ts",
            variables: [{ name: "data", lineNumber: 10 }],
          },
        ],
      });

      // ASSERT
      expect(scope.isDone()).toBe(true);
      expect(result.content).toBeDefined();

      // Restore original workspace
      process.env.WORKSPACE_FOLDER_PATHS = originalWorkspace;
    });
  });
});
