#!/usr/bin/env bash
set -euo pipefail

# Example: quote variables to prevent globbing/word-splitting
file="$1"
dir="${2:-.}"

echo "Processing file: $file"
for f in "$dir"/*.sh; do
    echo "Found: $f"
done

# Preserve arguments safely
process_args() {
    for arg in "$@"; do
        echo "Arg: $arg"
    done
}
process_args "$@"
