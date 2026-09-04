import assert from "node:assert/strict"
import { lstat, mkdir, mkdtemp, realpath, rename, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"

const projectRoot = process.cwd()
const stapleRoot = path.resolve(process.env.STAPLE_ROOT ?? path.join(projectRoot, "../STAPLE"))
const packageTarget = path.join(
  stapleRoot,
  "node_modules/@staple-verse/form-studio"
)
const packageBackup = `${packageTarget}.workspace-link-backup`
const verificationRoot = await mkdtemp(path.join(os.tmpdir(), "form-studio-staple-pack-"))
const npmCache = path.join(verificationRoot, "npm-cache")
let workspaceLinkMoved = false

try {
  const targetStat = await lstat(packageTarget)
  assert.ok(targetStat.isSymbolicLink(), `${packageTarget} must be the workspace symlink`)
  assert.equal(
    await realpath(packageTarget),
    await realpath(projectRoot),
    "STAPLE's Form Studio link points at an unexpected checkout"
  )
  await assertMissing(packageBackup)

  const pack = run(
    "npm",
    ["pack", "--json", "--pack-destination", verificationRoot],
    projectRoot
  )
  const tarballName = JSON.parse(pack.stdout)[0].filename
  const tarballPath = path.join(verificationRoot, tarballName)

  await rename(packageTarget, packageBackup)
  workspaceLinkMoved = true
  await mkdir(packageTarget, { recursive: true })
  run("tar", ["-xzf", tarballPath, "--strip-components=1", "-C", packageTarget], stapleRoot)
  run(
    "npm",
    [
      "install",
      "--omit=dev",
      "--ignore-scripts",
      "--legacy-peer-deps",
      "--package-lock=false",
      "--no-audit",
      "--no-fund",
    ],
    packageTarget
  )
  run(
    path.join(stapleRoot, "node_modules/.bin/vitest"),
    [
      "run",
      "src/forms/components/FormPlayground.test.tsx",
      "src/forms/utils/markerTemplateCapabilityFixtures.test.tsx",
      "src/forms/semantic/v1/defaultTemplatesSemanticV1.test.ts",
      "src/forms/semantic/v1/projectMemberSemanticV1.test.ts",
    ],
    stapleRoot
  )
} finally {
  if (workspaceLinkMoved) {
    await rm(packageTarget, { recursive: true, force: true })
    await rename(packageBackup, packageTarget)
  }
  await rm(verificationRoot, { recursive: true, force: true })
}

console.log("STAPLE's migrated Form Playground and Semantic V1 suites pass against the tarball.")

async function assertMissing(filePath) {
  try {
    await lstat(filePath)
    assert.fail(`Refusing to overwrite existing backup: ${filePath}`)
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
  }
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
