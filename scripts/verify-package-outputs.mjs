import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"

const projectRoot = process.cwd()
const distRoot = path.join(projectRoot, "dist")
const packageJson = JSON.parse(await readFile(path.join(projectRoot, "package.json"), "utf8"))
const runtimePackage = "@staple-verse/marker-template-runtime"

assert.equal(packageJson.sideEffects, false)
assert.deepEqual(Object.keys(packageJson.exports).sort(), [".", "./semantic-v1"])
assert.equal(packageJson.exports["."].import, "./dist/index.js")
assert.equal(packageJson.exports["."].types, "./dist/index.d.ts")
assert.equal(packageJson.exports["./semantic-v1"].import, "./dist/semantic-v1.js")
assert.equal(packageJson.exports["./semantic-v1"].types, "./dist/semantic-v1.d.ts")

const baseRuntimeGraph = await readLocalGraph(path.join(distRoot, "index.js"))
const baseDeclarationGraph = await readLocalGraph(path.join(distRoot, "index.d.ts"))
const semanticRuntimeGraph = await readLocalGraph(path.join(distRoot, "semantic-v1.js"))
const semanticDeclarationGraph = await readLocalGraph(path.join(distRoot, "semantic-v1.d.ts"))

assertGraphExcludesSemantic(baseRuntimeGraph, "base runtime")
assertGraphExcludesSemantic(baseDeclarationGraph, "base declarations")
assertGraphIncludesRuntime(semanticRuntimeGraph, "Semantic V1 runtime")
assertGraphIncludesRuntime(semanticDeclarationGraph, "Semantic V1 declarations")

for (const entry of ["index.js", "semantic-v1.js"]) {
  const text = await readFile(path.join(distRoot, entry), "utf8")
  assert.match(text, /^"use client";/, `${entry} must preserve the client boundary`)
}

const baseModule = await import(pathToFileURL(path.join(distRoot, "index.js")).href)
const semanticModule = await import(pathToFileURL(path.join(distRoot, "semantic-v1.js")).href)
for (const requiredExport of [
  "FormStudioProvider",
  "FormBuilder",
  "JsonEditor",
  "FormStudioDiagnostics",
  "defineFormStudioExtension",
]) {
  assert.ok(requiredExport in baseModule, `Missing base runtime export: ${requiredExport}`)
}
for (const forbiddenExport of [
  "semanticV1Extension",
  "SemanticDiagnosticsSummary",
  "computeSemanticDiagnostics",
  "validateSemanticV1",
]) {
  assert.ok(!(forbiddenExport in baseModule), `Semantic export leaked from base: ${forbiddenExport}`)
}
for (const requiredExport of [
  "semanticV1Extension",
  "getSemanticV1Value",
  "useSemanticV1Value",
]) {
  assert.ok(requiredExport in semanticModule, `Missing Semantic V1 runtime export: ${requiredExport}`)
}

const emittedFiles = await readdir(distRoot)
for (const requiredFile of ["index.js", "index.d.ts", "semantic-v1.js", "semantic-v1.d.ts"]) {
  assert.ok(emittedFiles.includes(requiredFile), `Build output is missing ${requiredFile}`)
}
assert.ok(emittedFiles.some((file) => file.startsWith("chunk-")), "Missing shared runtime chunks")
assert.ok(emittedFiles.some((file) => file.startsWith("types-")), "Missing shared declarations")

console.log("Package outputs preserve the base/Semantic V1 dependency boundary.")

async function readLocalGraph(entryPath) {
  const pending = [entryPath]
  const files = new Map()
  while (pending.length > 0) {
    const filePath = pending.pop()
    if (files.has(filePath)) continue
    const text = await readFile(filePath, "utf8")
    files.set(filePath, text)
    for (const specifier of importSpecifiers(text)) {
      if (!specifier.startsWith(".")) continue
      let dependencyPath = path.resolve(path.dirname(filePath), specifier)
      if (filePath.endsWith(".d.ts") && dependencyPath.endsWith(".js")) {
        dependencyPath = `${dependencyPath.slice(0, -3)}.d.ts`
      }
      pending.push(dependencyPath)
    }
  }
  return files
}

function importSpecifiers(text) {
  return Array.from(
    new Set(
      Array.from(
        text.matchAll(/(?:from\s*|import\s*\(?\s*)["']([^"']+)["']/g),
        (match) => match[1]
      )
    )
  )
}

function assertGraphExcludesSemantic(graph, label) {
  for (const [filePath, text] of graph) {
    assert.ok(!text.includes(runtimePackage), `${label} imports marker runtime in ${filePath}`)
    assert.ok(!text.includes("semanticV1Extension"), `${label} contains Semantic V1 in ${filePath}`)
  }
}

function assertGraphIncludesRuntime(graph, label) {
  assert.ok(
    Array.from(graph.values()).some((text) => text.includes(runtimePackage)),
    `${label} must reference ${runtimePackage}`
  )
}
