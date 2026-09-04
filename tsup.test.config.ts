import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["tests/capability-fixtures.test.tsx"],
  outDir: ".test-dist",
  format: ["esm"],
  target: "node20",
  platform: "node",
  bundle: true,
  splitting: false,
  clean: true,
  sourcemap: false,
  external: [
    "react",
    "react-dom",
    "@hello-pangea/dnd",
    "@heroicons/react",
    "@monaco-editor/react",
    "react-markdown",
    "remark-breaks",
    "remark-gfm",
    /^@rjsf\//,
  ],
})
