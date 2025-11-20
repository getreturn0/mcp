# Setting Up Signed npm Publishing with GitHub Actions

This guide will help you configure your npm package to be published with GitHub Actions, showing as signed and verified on npm.

## Prerequisites

1. An npm account with access to publish `@return-0/mcp-server` (free account works!)
2. A GitHub repository with Actions enabled

**Note:** The workflow uses `--provenance` which is **FREE** for all npm accounts. This shows the "Published with GitHub Actions" badge on npm. Full cryptographic package signing (different from provenance) requires npm Pro/Teams/Enterprise, but that's not needed for the GitHub Actions badge.

## Step 1: Set Up Trusted Publishing on npm

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Go to your package page: `https://www.npmjs.com/package/@return-0/mcp-server`
3. Click on **"Settings"** tab
4. Scroll down to **"Trusted Publishing"** section
5. Click **"Enable Trusted Publishing"**
6. Select **"GitHub Actions"** as the provider
7. Enter your GitHub organization/username and repository name
8. Click **"Approve"** to enable trusted publishing

This allows npm to verify that packages are published from your GitHub Actions workflow.

## Step 2: Create npm Access Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click on your profile picture → **"Access Tokens"**
3. Click **"Generate New Token"** → **"Automation"** (or **"Classic Token"** → **"Automation"**)
4. Copy the token (you won't be able to see it again!)

## Step 3: Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token from Step 2
6. Click **"Add secret"**

## Step 4: Publish Your Package

You have two options to trigger the workflow:

### Option A: Manual Workflow Dispatch

1. Go to your GitHub repository
2. Click on **"Actions"** tab
3. Select **"Publish to npm"** workflow
4. Click **"Run workflow"**
5. Choose version type (patch, minor, or major)
6. Click **"Run workflow"**

### Option B: Create a GitHub Release

1. Go to your GitHub repository
2. Click **"Releases"** → **"Create a new release"**
3. Create a new tag (e.g., `v1.0.2`)
4. Fill in release title and description
5. Click **"Publish release"**

The workflow will automatically:
- Run tests
- Build the package
- Publish to npm with provenance
- Show as "Published with GitHub Actions" on npm

## What You'll See on npm

After publishing, your package page on npm will show:
- ✅ **"Published with GitHub Actions"** badge
- ✅ **"Provenance"** information showing it was built and published from your GitHub repository
- ✅ Verified source and build information

## Troubleshooting

### "403 Forbidden" error
- Make sure your `NPM_TOKEN` has publish permissions
- Verify the token hasn't expired
- Check that you're using an Automation token (not a granular token with limited permissions)

### "Trusted publishing not enabled" warning
- Make sure you've completed Step 1 (Trusted Publishing setup)
- Verify the GitHub repository name matches exactly in npm settings

### Workflow not triggering
- Check that GitHub Actions are enabled in your repository settings
- Verify the workflow file is in `.github/workflows/publish.yml`
- Check the Actions tab for any error messages

## Additional Notes

- The `--provenance` flag enables GitHub Actions provenance, which shows the package was published via GitHub Actions - **this is FREE for all npm accounts**
- **What's FREE:** Provenance (shows "Published with GitHub Actions" badge) ✅
- **What requires Pro/Teams/Enterprise:** Full cryptographic package signing (different feature, not needed for the badge)
- The workflow automatically handles version bumping when using manual dispatch
- When creating a release, make sure the version in `package.json` matches the release tag

