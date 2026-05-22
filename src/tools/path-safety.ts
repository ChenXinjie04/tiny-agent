import path from "node:path";

export function resolveInsideWorkspace(inputPath: string): string {
  const workspaceRoot = process.cwd();
  const resolvedPath = path.resolve(workspaceRoot, inputPath);
  const relativePath = path.relative(workspaceRoot, resolvedPath);
  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`Path is outside workspace: ${inputPath}`);
  }

  return resolvedPath
}

