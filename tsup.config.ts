import { defineConfig } from "tsup"

const external = [
  "react",
  "react-dom",
  "@hello-pangea/dnd",
  "@heroicons/react",
  "@monaco-editor/react",
  "react-markdown",
  "remark-breaks",
  "remark-gfm",
]

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "semantic-v1": "src/semantic-v1/index.ts",
  },
  format: ["esm"],
  target: "es2020",
  platform: "neutral",
  bundle: true,
  splitting: true,
  clean: true,
  sourcemap: true,
  dts: true,
  external,
  noExternal: [/^@rjsf\//],
  banner: {
    js: '"use client";',
  },
})
