#!/bin/bash
# Runs the JumpGooberJumpWeb e2e suite in headless Chromium on spzeni1.
# Usage: ./run.sh   (expects the game server on 127.0.0.1:8123)
#
# IMPORTANT: --virtual-time-budget is required. Without it, headless Chromium
# stalls inside Phaser's audio decode and the boot never completes (no console
# error). --autoplay-policy=no-user-gesture-required lets the AudioContext run.
set -u
URL="http://127.0.0.1:8123/test/e2e/harness.html"
OUT=$(chromium --headless=new --no-sandbox --disable-gpu \
  --autoplay-policy=no-user-gesture-required \
  --virtual-time-budget=300000 \
  --dump-dom "$URL" 2>/dev/null)
echo "$OUT" | python3 -c "
import sys, re, html, json
dom = sys.stdin.read()
m = re.search(r'<div id=\"e2e-results\">(.*?)</div>', dom, re.S)
if not m:
    print('NO RESULTS DIV - harness did not run')
    sys.exit(2)
text = html.unescape(m.group(1))
if text.startswith('DONE|'):
    data = json.loads(text[5:])
    print('summary:', data['summary'])
    for t in data['tests']:
        mark = 'PASS' if t['pass'] else 'FAIL'
        print(f\"[{mark}] {t['name']}: {t['details']}\")
    sys.exit(0 if all(t['pass'] for t in data['tests']) else 1)
else:
    print(text[:3000])
    sys.exit(2)
"
