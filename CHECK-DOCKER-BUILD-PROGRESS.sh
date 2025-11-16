#!/bin/bash
# Run this in a NEW terminal window while build is running

echo "🔍 Checking Docker Build Progress..."
echo "===================================="

# Check if Docker build process is running
echo ""
echo "1️⃣ Active Docker processes:"
ps aux | grep "docker build" | grep -v grep || echo "⚠️  No active docker build found"

echo ""
echo "2️⃣ Docker build statistics:"
docker stats --no-stream 2>/dev/null || echo "No containers running yet"

echo ""
echo "3️⃣ System resources:"
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | head -1
echo ""
echo "Memory Usage:"
free -h | head -2

echo ""
echo "4️⃣ Check if build is actually progressing (watch disk activity):"
echo "   Run in separate terminal: watch -n 2 'du -sh ~/bell24h 2>/dev/null || echo Checking...'"
echo "   If the size is increasing, build is progressing!"

echo ""
echo "===================================="
echo "💡 Tips:"
echo "   - Step 27 (COPY node_modules) can take 5-15 minutes"
echo "   - This is NORMAL - node_modules can be 500MB+"
echo "   - If CPU is at 100%, it's working hard"
echo "   - If disk space is increasing, it's copying files"
echo "===================================="

