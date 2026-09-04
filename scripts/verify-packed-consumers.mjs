import assert from "node:assert/strict"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"

const projectRoot = process.cwd()
const verificationRoot = await mkdtemp(path.join(os.tmpdir(), "form-studio-consumers-"))
const npmCache = path.join(verificationRoot, "npm-cache")

try {
  const pack = run("npm", ["pack", "--json", "--pack-destination", verificationRoot], projectRoot)
  const tarballName = JSON.parse(pack.stdout)[0].filename
  const tarballPath = path.join(verificationRoot, tarballName)

  for (const fixture of [
    {
      name: "react18",
      react: "18.2.0",
      reactTypes: "18.0.25",
      reactDomTypes: "18.3.7",
    },
    {
      name: "react19",
      react: "19.2.7",
      reactTypes: "19.2.17",
      reactDomTypes: "19.2.3",
    },
  ]) {
    await verifyFixture(fixture, tarballPath)
  }
} finally {
  await rm(verificationRoot, { recursive: true, force: true })
}

console.log("Packed base and Semantic V1 entries work with React 18 and React 19.")

async function verifyFixture(fixture, tarballPath) {
  const fixtureRoot = path.join(verificationRoot, fixture.name)
  const packageJson = {
    name: `form-studio-${fixture.name}-fixture`,
    private: true,
    type: "module",
    dependencies: {
      "@staple-verse/form-studio": `file:${tarballPath}`,
      react: fixture.react,
      "react-dom": fixture.react,
    },
    devDependencies: {
      "@types/react": fixture.reactTypes,
      "@types/react-dom": fixture.reactDomTypes,
      "@types/scheduler": "0.16.8",
      typescript: "5.9.3",
    },
  }
  const tsconfig = {
    compilerOptions: {
      target: "ES2020",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: false,
      outDir: "build",
    },
    include: ["consumer.ts"],
  }

  await mkdir(fixtureRoot, { recursive: true })
  await writeFile(path.join(fixtureRoot, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`)
  await writeFile(path.join(fixtureRoot, "tsconfig.json"), `${JSON.stringify(tsconfig, null, 2)}\n`)
  await writeFile(path.join(fixtureRoot, "consumer.ts"), createConsumerSource())

  run(
    "npm",
    ["install", "--ignore-scripts", "--legacy-peer-deps", "--no-audit", "--no-fund"],
    fixtureRoot
  )
  run(path.join(fixtureRoot, "node_modules/.bin/tsc"), ["-p", "tsconfig.json"], fixtureRoot)
  const execution = run("node", ["build/consumer.js"], fixtureRoot)
  assert.match(execution.stdout, new RegExp(`${fixture.react}:semantic-present`))
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, npm_config_cache: npmCache },
  })
  assert.ifError(result.error)
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed in ${cwd}\n${result.stdout}\n${result.stderr}`
  )
  return result
}

function createConsumerSource() {
  return `
import React from "react"
import { renderToString } from "react-dom/server"
import {
  FormStudioProvider,
  useFormStudio,
  type FormStudioState,
} from "@staple-verse/form-studio"
import {
  getSemanticV1Value,
  semanticV1Extension,
  useSemanticV1Value,
  type SemanticV1Component,
} from "@staple-verse/form-studio/semantic-v1"

const semantics: SemanticV1Component = {
  root: { classIri: "https://example.org/Fixture" },
  bindings: [],
}
const state: FormStudioState = {
  schema: { type: "object" },
  uiSchema: {},
  extensionValues: { [semanticV1Extension.id]: semantics },
  formData: {},
}
if (getSemanticV1Value(state)?.root?.classIri !== semantics.root?.classIri) {
  throw new Error("Typed Semantic V1 state accessor failed")
}

function Probe() {
  const { value } = useSemanticV1Value()
  const { validateForCommit } = useFormStudio()
  if (validateForCommit().blocked) throw new Error("Valid semantics blocked commit")
  return React.createElement("span", null, value ? "semantic-present" : "semantic-absent")
}

const markup = renderToString(
  React.createElement(
    FormStudioProvider,
    {
      extensions: [semanticV1Extension],
      initialSchema: state.schema,
      initialExtensionValues: state.extensionValues,
    },
    React.createElement(Probe)
  )
)
if (!markup.includes("semantic-present")) throw new Error(markup)
console.log(\`\${React.version}:semantic-present\`)
`
}
