# Koi to the Moon

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

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```
