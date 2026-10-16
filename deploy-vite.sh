#!/bin/bash

# ============================================================
# deploy-vite.sh
# MAE101a
#
# Vite → Build → Git → Commit → Push → Git Tag → GitHub Pages
#
# Repository:
#   https://github.com/maitheduy/MAE101a
#
# Expected Pages URL:
#   https://maitheduy.github.io/MAE101a/
#
# ============================================================

set -e

# ------------------------------------------------------------
# COLORS / OUTPUT
# ------------------------------------------------------------

RED=""
GREEN=""
YELLOW=""
BLUE=""
RESET=""

info() {
    echo ""
    echo "[INFO] $1"
}

success() {
    echo "[OK]   $1"
}

warn() {
    echo ""
    echo "[WARN] $1"
}

error() {
    echo ""
    echo "[ERROR] $1"
    exit 1
}

# ------------------------------------------------------------
# PROJECT CONFIGURATION
# ------------------------------------------------------------

EXPECTED_OWNER="maitheduy"
EXPECTED_REPO="MAE101a"

EXPECTED_REMOTE="https://github.com/maitheduy/MAE101a.git"

PAGES_URL="https://maitheduy.github.io/MAE101a/"

# ------------------------------------------------------------
# HEADER
# ------------------------------------------------------------

echo ""
echo "============================================================"
echo "              MAE101a DEPLOYMENT SCRIPT"
echo "============================================================"
echo ""
echo "Repository : https://github.com/maitheduy/MAE101a"
echo "Branch     : main"
echo "Platform   : Vite + GitHub Pages"
echo ""

# ------------------------------------------------------------
# 1. CHECK ENVIRONMENT
# ------------------------------------------------------------

info "Checking environment..."

command -v git >/dev/null 2>&1 || error "Git is not installed."

command -v node >/dev/null 2>&1 || error "Node.js is not installed."

command -v npm >/dev/null 2>&1 || error "npm is not installed."

success "Git   : $(git --version)"
success "Node  : $(node --version)"
success "npm   : $(npm --version)"

# ------------------------------------------------------------
# 2. CHECK PROJECT ROOT
# ------------------------------------------------------------

info "Checking project structure..."

if [ ! -f "package.json" ]; then
    error "package.json was not found.

Run this script from the project root."
fi

if [ -f "vite.config.ts" ]; then
    success "Found vite.config.ts"
elif [ -f "vite.config.js" ]; then
    success "Found vite.config.js"
elif [ -f "vite.config.mjs" ]; then
    success "Found vite.config.mjs"
else
    warn "No vite.config.* file detected.

The project may still build, so the script will continue."
fi

success "package.json found."

# ------------------------------------------------------------
# 3. READ PACKAGE INFORMATION
# ------------------------------------------------------------

info "Reading package.json..."

PROJECT_NAME=$(node -p "require('./package.json').name || 'MAE101a'")
PROJECT_VERSION=$(node -p "require('./package.json').version || '0.0.0'")

echo ""
echo "Project name : $PROJECT_NAME"
echo "Version      : $PROJECT_VERSION"
echo ""

# ------------------------------------------------------------
# 4. CHECK BUILD SCRIPT
# ------------------------------------------------------------

info "Checking npm scripts..."

HAS_BUILD_SCRIPT=$(node -e "
const p = require('./package.json');
process.exit(p.scripts && p.scripts.build ? 0 : 1);
" 2>/dev/null || true)

if [ -z "$HAS_BUILD_SCRIPT" ]; then
    :
fi

node - <<'NODE'
const fs = require("fs");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

if (!pkg.scripts || !pkg.scripts.build) {
    console.error("[ERROR] No 'build' script found in package.json.");
    process.exit(1);
}

console.log("[OK]   npm run build is available.");
NODE

# ------------------------------------------------------------
# 5. INSTALL DEPENDENCIES
# ------------------------------------------------------------

info "Installing dependencies..."

if [ -f "package-lock.json" ]; then
    echo "package-lock.json detected."
    echo "Running: npm ci"
    echo ""

    npm ci
else
    echo "No package-lock.json detected."
    echo "Running: npm install"
    echo ""

    npm install
fi

success "Dependencies installed."

# ------------------------------------------------------------
# 6. BUILD PROJECT
# ------------------------------------------------------------

info "Building Vite project..."

rm -rf dist

npm run build

if [ ! -d "dist" ]; then
    error "Vite build completed but dist/ was not created."
fi

success "Build completed."
success "Build output: dist/"

# ------------------------------------------------------------
# 7. SHOW BUILD RESULT
# ------------------------------------------------------------

info "Inspecting build output..."

echo ""

if [ -f "dist/index.html" ]; then
    success "dist/index.html exists."
else
    warn "dist/index.html was not found.

Please inspect the build output before deploying."
fi

echo ""

echo "Build directory:"
du -sh dist 2>/dev/null || true

echo ""

# ------------------------------------------------------------
# 8. CHECK GIT REPOSITORY
# ------------------------------------------------------------

info "Checking Git repository..."

if [ ! -d ".git" ]; then
    warn "Git repository not found."

    echo "Initializing Git repository..."
    git init
    git branch -M main

    success "Git repository initialized."
else
    success "Git repository already exists."
fi

# ------------------------------------------------------------
# 9. FORCE MAIN BRANCH
# ------------------------------------------------------------

info "Checking current branch..."

CURRENT_BRANCH=$(git branch --show-current || true)

if [ "$CURRENT_BRANCH" != "main" ]; then

    if [ -z "$CURRENT_BRANCH" ]; then
        git switch -c main 2>/dev/null || git checkout -b main
    else
        echo "Current branch: $CURRENT_BRANCH"
        echo "Switching to main..."

        git switch main 2>/dev/null || git checkout main
    fi
fi

success "Active branch: main"

# ------------------------------------------------------------
# 10. CONFIGURE GITHUB REMOTE
# ------------------------------------------------------------

info "Checking GitHub remote..."

REMOTE_EXISTS=0

if git remote get-url origin >/dev/null 2>&1; then
    REMOTE_EXISTS=1

    EXISTING_REMOTE=$(git remote get-url origin)

    echo ""
    echo "Current origin:"
    echo "$EXISTING_REMOTE"
    echo ""

    if [ "$EXISTING_REMOTE" != "$EXPECTED_REMOTE" ]; then

        warn "origin does not point to MAE101a."

        echo "Updating origin to:"
        echo "$EXPECTED_REMOTE"

        git remote set-url origin "$EXPECTED_REMOTE"

        success "origin updated."

    else
        success "origin already points to MAE101a."
    fi

else

    echo "No origin remote found."

    git remote add origin "$EXPECTED_REMOTE"

    success "origin added:"
    echo "$EXPECTED_REMOTE"

fi

# ------------------------------------------------------------
# 11. SHOW REMOTE
# ------------------------------------------------------------

info "Git remote configuration..."

git remote -v

# ------------------------------------------------------------
# 12. GIT STATUS BEFORE COMMIT
# ------------------------------------------------------------

info "Checking Git status..."

git status

# ------------------------------------------------------------
# 13. STAGE ALL FILES
# ------------------------------------------------------------

info "Staging files..."

git add .

success "Files staged."

# ------------------------------------------------------------
# 14. CHECK STAGED CHANGES
# ------------------------------------------------------------

info "Checking staged changes..."

if git diff --cached --quiet; then

    warn "No staged changes detected."

else

    echo ""
    git diff --cached --stat
    echo ""

fi

# ------------------------------------------------------------
# 15. COMMIT
# ------------------------------------------------------------

info "Creating commit..."

COMMIT_MESSAGE="Deploy MAE101a v$PROJECT_VERSION"

if git diff --cached --quiet; then

    echo "No new changes to commit."

else

    git commit -m "$COMMIT_MESSAGE"

    success "Commit created:"
    echo "$COMMIT_MESSAGE"

fi

# ------------------------------------------------------------
# 16. PUSH MAIN BRANCH
# ------------------------------------------------------------

info "Pushing main branch to GitHub..."

git push -u origin main

success "main branch pushed successfully."

# ------------------------------------------------------------
# 17. VERSION TAG
# ------------------------------------------------------------

info "Preparing Git tag..."

TAG="v$PROJECT_VERSION"

echo ""
echo "Package version : $PROJECT_VERSION"
echo "Git tag         : $TAG"
echo ""

# ------------------------------------------------------------
# 18. CHECK EXISTING TAG
# ------------------------------------------------------------

if git rev-parse "$TAG" >/dev/null 2>&1; then

    warn "Tag $TAG already exists locally."

    echo "The existing tag will not be recreated."

else

    git tag -a "$TAG" -m "Release MAE101a $TAG"

    success "Created local tag: $TAG"

fi

# ------------------------------------------------------------
# 19. PUSH TAG
# ------------------------------------------------------------

info "Pushing Git tag to GitHub..."

if git ls-remote --tags origin "refs/tags/$TAG" | grep -q "$TAG"; then

    warn "Tag $TAG already exists on GitHub."

else

    git push origin "$TAG"

    success "Tag pushed to GitHub: $TAG"

fi

# ------------------------------------------------------------
# 20. FINAL GIT STATUS
# ------------------------------------------------------------

info "Final Git status..."

git status

echo ""

# ------------------------------------------------------------
# 21. SHOW LAST COMMIT
# ------------------------------------------------------------

info "Latest commit..."

git log -1 --oneline

# ------------------------------------------------------------
# 22. SHOW TAG
# ------------------------------------------------------------

info "Latest tag..."

git describe --tags --abbrev=0 2>/dev/null || true

# ------------------------------------------------------------
# 23. DEPLOYMENT SUMMARY
# ------------------------------------------------------------

echo ""
echo "============================================================"
echo "              MAE101a DEPLOYMENT COMPLETE"
echo "============================================================"
echo ""

echo "Repository:"
echo "https://github.com/maitheduy/MAE101a"

echo ""

echo "Branch:"
echo "main"

echo ""

echo "Version:"
echo "$PROJECT_VERSION"

echo ""

echo "Tag:"
echo "$TAG"

echo ""

echo "Build:"
echo "dist/"

echo ""

echo "Expected GitHub Pages URL:"
echo "$PAGES_URL"

echo ""

echo "============================================================"
echo "NEXT STEP"
echo "============================================================"
echo ""
echo "GitHub → MAE101a → Settings → Pages"
echo ""
echo "Configure GitHub Pages according to the repository's"
echo "Pages/Actions configuration."
echo ""
echo "After Pages deployment completes, open:"
echo ""
echo "$PAGES_URL"
echo ""

echo "============================================================"
echo "DONE"
echo "============================================================"
echo ""