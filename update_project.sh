#!/usr/bin/env bash

set -euo pipefail

error() {
  echo "Error: $1" >&2
  exit 1
}

if [[ $# -ne 1 ]]; then
  error "Usage: $0 <destination_project_directory>"
fi

DEST_PROJECT_DIR="$(cd "$1" && pwd 2>/dev/null)" \
  || error "Destination project directory does not exist: $1"

[[ -f "package.json" ]] || error "package.json not found in current directory"
[[ -d "dist" ]] || error "dist/ directory not found. Did you run the build?"

PACKAGE_NAME=$(node -p "require('./package.json').name" 2>/dev/null) \
  || error "Failed to read package name from package.json"

[[ -n "$PACKAGE_NAME" ]] || error "Package name is empty"

NODE_MODULES_DIR="$DEST_PROJECT_DIR/node_modules"
TARGET_DIR="$NODE_MODULES_DIR/$PACKAGE_NAME"

mkdir -p "$NODE_MODULES_DIR"

if [[ -d "$TARGET_DIR" ]]; then
  rm -rf "$TARGET_DIR"
fi

mkdir -p "$TARGET_DIR"

cp -r dist "$TARGET_DIR/"
cp package.json "$TARGET_DIR/"

if [[ -f "LICENSE" ]]; then
  cp LICENSE "$TARGET_DIR/"
fi

echo "Package '$PACKAGE_NAME' deployed to:"
echo "  $TARGET_DIR"

