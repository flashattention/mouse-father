#!/usr/bin/env sh
# Rebuild index.html from the source parts in src/
cd "$(dirname "$0")"
cat src/head.html src/lib.js src/game.js src/post.js src/quality.js src/tail.js > index.html
echo "built index.html"
