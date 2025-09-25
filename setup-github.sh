#!/bin/bash

# Setup script for GitHub repository with branch protection and CI/CD
# Run this after creating the repository on GitHub

set -e

echo "🚀 Setting up Infinite Canvas Diagram GitHub repository..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh (macOS)"
    echo "   Or visit: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub first:"
    gh auth login
fi

# Get repository details
read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter repository name (default: infinite-canvas-diagram): " REPO_NAME
REPO_NAME=${REPO_NAME:-infinite-canvas-diagram}

# Create repository if it doesn't exist
echo "📦 Creating GitHub repository..."
gh repo create "$GITHUB_USER/$REPO_NAME" \
    --public \
    --description "Keyboard-first infinite canvas for code visualization" \
    --homepage "https://infinite-canvas.app" \
    || echo "Repository might already exist, continuing..."

# Set up git remote
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || \
git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Create and push initial branches
echo "🌳 Setting up branches..."
git add -A
git commit -m "Initial commit: Project setup with CI/CD" || true
git branch -M main
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop

# Set default branch to develop for day-to-day work
gh repo edit --default-branch develop

# Configure branch protection for main
echo "🔒 Setting up branch protection for 'main'..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$GITHUB_USER/$REPO_NAME/branches/main/protection" \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=lint" \
  --field "required_status_checks[contexts][]=test-unit" \
  --field "required_status_checks[contexts][]=test-e2e" \
  --field "required_status_checks[contexts][]=build" \
  --field "required_status_checks[contexts][]=security" \
  --field "enforce_admins=false" \
  --field "required_pull_request_reviews[required_approving_review_count]=1" \
  --field "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  --field "restrictions=null" \
  --field "allow_force_pushes=false" \
  --field "allow_deletions=false"

# Configure branch protection for develop (lighter rules)
echo "🔒 Setting up branch protection for 'develop'..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$GITHUB_USER/$REPO_NAME/branches/develop/protection" \
  --field "required_status_checks[strict]=false" \
  --field "required_status_checks[contexts][]=lint" \
  --field "required_status_checks[contexts][]=test-unit" \
  --field "enforce_admins=false" \
  --field "required_pull_request_reviews=null" \
  --field "restrictions=null" \
  --field "allow_force_pushes=false" \
  --field "allow_deletions=false"

# Create labels for issues and PRs
echo "🏷️  Creating labels..."
gh label create "bug" --description "Something isn't working" --color "d73a4a" || true
gh label create "enhancement" --description "New feature or request" --color "a2eeef" || true
gh label create "documentation" --description "Improvements or additions to documentation" --color "0075ca" || true
gh label create "performance" --description "Performance improvements" --color "fcba03" || true
gh label create "accessibility" --description "Accessibility improvements" --color "5319e7" || true
gh label create "testing" --description "Testing improvements" --color "0e8a16" || true
gh label create "security" --description "Security vulnerability or improvement" --color "ee0000" || true
gh label create "ui/ux" --description "User interface and experience" --color "7057ff" || true
gh label create "ci/cd" --description "Continuous integration and deployment" --color "000000" || true
gh label create "good first issue" --description "Good for newcomers" --color "7057ff" || true

# Create initial issues
echo "📝 Creating initial issues..."
gh issue create \
  --title "Set up initial React + TypeScript + Vite project" \
  --body "Initialize the project with React, TypeScript, and Vite. Install core dependencies including Konva.js, Zustand, and testing libraries." \
  --label "enhancement"

gh issue create \
  --title "Implement ViewportManager for infinite canvas" \
  --body "Create the core viewport system with pan, zoom, and coordinate transformation capabilities. See docs/research/infinite-canvas-drawing/SNIPPETS/viewport-system.ts for reference implementation." \
  --label "enhancement"

gh issue create \
  --title "Implement keyboard navigation system" \
  --body "Create spatial keyboard navigation with arrow keys, tab navigation, and auto-focus camera. See docs/research/infinite-canvas-drawing/SNIPPETS/keyboard-navigation.ts for reference implementation." \
  --label "enhancement,accessibility"

# Set up repository topics
echo "🏷️  Setting repository topics..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$GITHUB_USER/$REPO_NAME/topics" \
  --field "names[]=react" \
  --field "names[]=typescript" \
  --field "names[]=canvas" \
  --field "names[]=diagram" \
  --field "names[]=konvajs" \
  --field "names[]=infinite-canvas" \
  --field "names[]=accessibility" \
  --field "names[]=keyboard-navigation"

# Create GitHub Actions secrets placeholder
echo "🔐 Creating secrets (you'll need to add the actual values)..."
echo ""
echo "Please add the following secrets in GitHub repository settings:"
echo "  - VERCEL_TOKEN"
echo "  - VERCEL_SCOPE"
echo "  - SENTRY_DSN"
echo "  - SENTRY_AUTH_TOKEN"
echo "  - SENTRY_ORG"
echo "  - SENTRY_PROJECT"
echo "  - POSTHOG_KEY"
echo "  - CLOUDFLARE_ZONE_ID"
echo "  - CLOUDFLARE_API_TOKEN"
echo ""

# Create initial GitHub Pages for documentation (optional)
echo "📚 Setting up GitHub Pages..."
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$GITHUB_USER/$REPO_NAME/pages" \
  --field "source[branch]=main" \
  --field "source[path]=/docs" \
  || echo "GitHub Pages might already be configured"

# Summary
echo ""
echo "✅ GitHub repository setup complete!"
echo ""
echo "Repository: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "Next steps:"
echo "1. Add repository secrets in Settings > Secrets and variables > Actions"
echo "2. Create your first feature branch: git checkout -b feature/IC-001-setup"
echo "3. Run: npm create vite@latest . -- --template react-ts"
echo "4. Install dependencies: npm install konva react-konva zustand"
echo "5. Start development: npm run dev"
echo ""
echo "Branch protection is active:"
echo "  - 'main' branch requires PR reviews and passing CI checks"
echo "  - 'develop' branch requires passing CI checks"
echo ""
echo "To create a PR:"
echo "  gh pr create --title 'Your title' --body 'Description'"
echo ""
echo "Happy coding! 🚀"