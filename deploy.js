const { execSync } = require("child_process");
const fs = require("fs");

const versionType = process.argv[2]; // 'patch', 'minor', 'major', or undefined

console.log("🚀 Deploying @return-0/mcp-server to npm...\n");

// Get current version
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const currentVersion = packageJson.version;
console.log(`Current version: ${currentVersion}\n`);

try {
  // Step 1: Run tests
  console.log("🧪 Step 1: Running tests...");
  execSync("npm test", { stdio: "inherit" });
  console.log("✓ Tests passed\n");

  // Step 2: Clean dist folder
  console.log("🧹 Step 2: Cleaning dist folder...");
  if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true, force: true });
    console.log("✓ Dist folder removed\n");
  }

  // Step 3: Build
  console.log("📦 Step 3: Building package...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("✓ Build complete\n");

  // Step 4: Update version
  if (versionType) {
    console.log(`📝 Step 4: Bumping ${versionType} version...`);
    execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: "inherit" });
    
    // Read updated version
    const updatedPackageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const newVersion = updatedPackageJson.version;
    console.log(`✓ Version updated: ${currentVersion} → ${newVersion}\n`);
  } else {
    console.log("⚠️  No version type specified. Publishing current version.\n");
    console.log("   Usage: npm run deploy -- [patch|minor|major]");
    console.log("   Example: npm run deploy -- patch\n");
  }

  // Step 5: Publish
  console.log("📤 Step 5: Publishing to npm...");
  execSync("npm publish --access public", { stdio: "inherit" });
  console.log("✓ Published successfully\n");

  // Get final version
  const finalPackageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const finalVersion = finalPackageJson.version;

  console.log("\n✅ Deployment complete!");
  console.log(`📦 Package: @return-0/mcp-server@${finalVersion}`);
  console.log(`🌐 Homepage: https://getreturn0.com`);
  console.log(`📥 Install: npm install -g @return-0/mcp-server\n`);

} catch (error) {
  console.error("\n❌ Deployment failed:", error.message);
  process.exit(1);
}

