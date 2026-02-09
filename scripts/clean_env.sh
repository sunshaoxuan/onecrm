#!/bin/bash
echo "Cleaning environment..."
rm -f *.ps1 *.tmp 2>/dev/null
rm -rf ./dev_temp 2>/dev/null || true
echo "Cleanup complete."
