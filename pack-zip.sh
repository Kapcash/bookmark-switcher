#!/bin/bash

SUFFIX=$1
ZIP_NAME=$(jq -r '"\(.name)-v\(.version)"' package.json)

# Concatenate the suffix if provided
if [ -n "$SUFFIX" ]; then
  ZIP_NAME="${ZIP_NAME}-${SUFFIX}"
fi

ZIP_NAME="./artifacts/${ZIP_NAME}.zip"

# Remove the old zip file if it exists and create a new one
rimraf "$ZIP_NAME" && jszip-cli add extension/* -o "./$ZIP_NAME"
