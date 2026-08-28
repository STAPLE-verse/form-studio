import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"

const projectRoot = process.cwd()
const distRoot = path.join(projectRoot, "dist")
const baseline = JSON.parse(
  await readFile(path.join(projectRoot, "tests/baselines/semantic-v1-pre-registry.json"), "utf8")
)
const packageJson = JSON.parse(await readFile(path.join(projectRoot, "package.json"), "utf8"))

const emittedFiles = (await readdir(distRoot, { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort()
const runtimeModule = await import(path.join(distRoot, "index.js"))
const runtimeExports = Object.keys(runtimeModule).sort()

const declarationPath = path.join(distRoot, "index.d.ts")
const declarationProgram = ts.createProgram([declarationPath], {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
})
const declarationSource = declarationProgram.getSourceFile(declarationPath)
assert.ok(declarationSource, `Missing declaration output: ${declarationPath}`)
const declarationSymbol = declarationProgram.getTypeChecker().getSymbolAtLocation(declarationSource)
assert.ok(declarationSymbol, `Could not inspect declaration exports: ${declarationPath}`)
const declarationExports = declarationProgram
  .getTypeChecker()
  .getExportsOfModule(declarationSymbol)
  .map((symbol) => symbol.getName())
  .sort()

const bundleText = await readFile(path.join(distRoot, "index.js"), "utf8")
const staticImports = Array.from(
  new Set(
    Array.from(bundleText.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g), (match) => match[1])
  )
).sort()

assert.deepEqual(Object.keys(packageJson.exports).sort(), baseline.packageExportSubpaths)
assert.deepEqual(emittedFiles, baseline.emittedFiles)
assert.deepEqual(runtimeExports, baseline.runtimeExports)
assert.deepEqual(declarationExports, baseline.declarationExports)
assert.deepEqual(staticImports, baseline.mainBundleStaticImports)

console.log("Phase 0 public API and bundle baseline matches the pre-registry build.")
