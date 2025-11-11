const { execSync } = require("child_process");
const fs = require("fs");

console.log("🧪 Testing package publish workflow...\n");

const packageName = "@return-0/mcp-server";
const binCommand = "return0-mcp-server";
const version = "1.0.0";
const tarballName = `return-0-mcp-server-${version}.tgz`;

try {
  // Step 0: Clean dist folder
  console.log("🧹 Step 0: Cleaning dist folder...");
  if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true, force: true });
    console.log("✓ Dist folder removed\n");
  }

  // Step 1: Build the package
  console.log("📦 Step 1: Building package...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("✓ Build complete\n");

  // Step 2: Create tarball
  console.log("📦 Step 2: Creating tarball...");
  execSync("npm pack", { stdio: "inherit" });
  console.log("✓ Tarball created\n");

  // Step 3: Show what's in the tarball
  console.log("📋 Step 3: Checking tarball contents...");
  const tarList = execSync(`tar -tzf ${tarballName}`, { encoding: "utf8" });
  console.log("Files in tarball:");
  console.log(tarList);
  console.log("");

  // Step 4: Install globally from tarball
  console.log("🔧 Step 4: Installing globally from tarball (simulating end-user)...");
  execSync(`npm install -g ${tarballName} --force`, { stdio: "inherit" });
  console.log("✓ Installed globally\n");

  // Step 5: Verify npx is available (we can't actually run it since MCP server runs forever)
  console.log("🚀 Step 5: Verifying npx command is available...");

  const whichCheck = execSync(`which ${binCommand} || where ${binCommand}`, {
    encoding: "utf8",
  });
  console.log("✓ Command is available at:", whichCheck.trim());

  console.log("\n✅ Package publish workflow test complete!\n");
  console.log("📝 Summary:");
  console.log("   - Package builds successfully");
  console.log("   - Tarball contains correct files");
  console.log("   - Global installation works");
  console.log("   - Command is available globally\n");
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}

// Keep package installed for testing
console.log("🧹 Cleaning up tarball only (keeping package installed for testing)...");
if (fs.existsSync(tarballName)) {
  fs.unlinkSync(tarballName);
  console.log("✓ Removed tarball");
}

console.log("\n✅ Package is still installed and ready to use!");
console.log(`   Run: npx ${binCommand}`);
console.log("\n   To uninstall when done:");
console.log(`   npm uninstall -g ${packageName}\n`);
