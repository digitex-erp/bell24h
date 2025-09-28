#!/bin/bash
# Direct execution wrapper - completely bypasses q prefix
source ~/.bashrc_cursor_fix 2>/dev/null || true
exec "$@"
