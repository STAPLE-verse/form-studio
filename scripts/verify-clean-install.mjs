import assert from "node:assert/strict"
import { cp, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"

const projectRoot = process.cwd()
const verificationRoot = await mkdtemp(path.join(os.tmpdir(), "form-studio-clean-install-"))
const cleanProject = path.join(verificationRoot, "project")
const npmCache = path.join(verificationRoot, "npm-cache")
const capabilityFixtureSource = path.resolve(
  projectRoot,
  "../marker-template-spec/fixtures/v1/capabilities"
)
const capabilityFixtureTarget = path.join(
  verificationRoot,
  "marker-template-spec/fixtures/v1/capabilities"
)

try {
  await cp(projectRoot, cleanProject, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(projectRoot, source)
      const firstSegment = relative.split(path.sep)[0]
      return ![".git", "node_modules", "dist", ".test-dist"].includes(firstSegment)
    },
  })
  await mkdir(path.dirname(capabilityFixtureTarget), { recursive: true })
  await cp(capabilityFixtureSource, capabilityFixtureTarget, { recursive: true })
  run("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], cleanProject)
  run("npm", ["run", "typecheck"], cleanProject)
  run("npm", ["test"], cleanProject)
  await assertDirectoriesEqual(
    path.join(projectRoot, "dist"),
    path.join(cleanProject, "dist")
  )
} finally {
  await rm(verificationRoot, { recursive: true, force: true })
}

console.log("Clean npm install, typecheck, tests, and reproducible package build passed.")

async function assertDirectoriesEqual(expectedRoot, actualRoot) {
  const expectedFiles = await listFiles(expectedRoot)
  const actualFiles = await listFiles(actualRoot)
  assert.deepEqual(actualFiles, expectedFiles, "Clean build emitted a different dist file set")

  for (const relativePath of expectedFiles) {
    const [expected, actual] = await Promise.all([
      readFile(path.join(expectedRoot, relativePath)),
      readFile(path.join(actualRoot, relativePath)),
    ])
    assert.ok(expected.equals(actual), `Clean build differs at dist/${relativePath}`)
  }
}

async function listFiles(root, relativeRoot = "") {
  const entries = await readdir(path.join(root, relativeRoot), { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const relativePath = path.join(relativeRoot, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(root, relativePath)))
    else files.push(relativePath)
  }
  return files.sort()
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
}
