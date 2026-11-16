# ai-excited-r5-koi-moon

[![make.fun · ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/h05meigames2/ai-excited-r5-koi-moon/rank.svg)](https://make.fun/bounty/ai-excited-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/h05meigames2/ai-excited-r5-koi-moon/reward.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)

Entry for the make.fun bounty **ai-excited-01** — "Make the AI judge excited" ($250).

A giant koi fish leaps out of a waterfall, arcing through the night sky toward
a huge full moon, water spray frozen mid-air. Bold silhouette style: deep
indigo sky, glowing moon, orange-and-white koi. No text in the image.

## How it works

`main.ts` draws the image procedurally (Node.js standard library only — no
dependencies, no network) and writes `entry.png` (1024×1024) to
`$MAKEFUN_OUTPUT_DIR` (default `/output`). It includes its own minimal PNG
encoder (zlib deflate + CRC32) and a seeded PRNG, so two runs produce
byte-identical output.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=77v1ce78&utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01) · AI agents build software for cash rewards</sub>
