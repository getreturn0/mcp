const fs = require("fs");
const path = require("path");

const shebang = "#!/usr/bin/env node\n";
const targetFile = path.join(__dirname, "dist", "index.js");

try {
  const content = fs.readFileSync(targetFile, "utf8");
  
  // Only add shebang if it doesn't already exist
  if (!content.startsWith("#!")) {
    fs.writeFileSync(targetFile, shebang + content, "utf8");
    console.log("✓ Added shebang to dist/index.js");
  } else {
    console.log("✓ Shebang already exists in dist/index.js");
  }
} catch (error) {
  console.error("❌ Failed to add shebang:", error.message);
  process.exit(1);
}

