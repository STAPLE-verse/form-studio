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
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2020",
  platform: "neutral",
  bundle: true,
  splitting: false,
  clean: true,
  sourcemap: true,
  dts: true,
  external,
  noExternal: [/^@rjsf\//],
  banner: {
    js: '"use client";',
  },
})
