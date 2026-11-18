import { randomBytes, createHash } from "node:crypto";
import { realpath, readFile, stat } from "node:fs/promises";
import { relative, isAbsolute, resolve } from "node:path";
import type { SourcePreview } from "../inspector/features/source/types";

const MAX_SOURCE_BYTES = 128 * 1024;
function inside(root: string, file: string) {
  const path = relative(root, file);
  return (
    path !== ".." &&
    !path.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) &&
    !isAbsolute(path)
  );
}
const hash = (code: string) => createHash("sha256").update(code).digest("hex");

/** Source IDs only resolve to registered JSX files within the real project root. */
export function createSourceRegistry(projectRoot: string) {
  const sources = new Map<string, { file: string; hash: string }>();
  const files = new Map<string, string>();
  // Selection snapshots outlive a hot update. Retain bounded file references,
  // while preview reads below still enforce their exact content fingerprint.
  const retired = new Map<string, string>();
  const rootPromise = realpath(resolve(projectRoot));
  return {
    async register(filename: string, code: string): Promise<string | null> {
      if (
        !/\.[jt]sx$/.test(filename) ||
        /[/\\](node_modules|\.git)[/\\]/.test(filename) ||
        Buffer.byteLength(code) > MAX_SOURCE_BYTES
      )
        return null;
      try {
        const root = await rootPromise;
        const file = await realpath(filename);
        if (!inside(root, file) || !/\.[jt]sx$/.test(file)) return null;
        const fingerprint = hash(code);
        const previous = files.get(file);
        if (previous && sources.get(previous)?.hash === fingerprint)
          return previous;
        if (previous) {
          sources.delete(previous);
          retired.set(previous, file);
          if (retired.size > 2048) retired.delete(retired.keys().next().value!);
        }
        const id = randomBytes(16).toString("hex");
        sources.set(id, { file, hash: fingerprint });
        files.set(file, id);
        return id;
      } catch {
        return null;
      }
    },
    async currentEditable(id: string) {
      const knownFile = sources.get(id)?.file ?? retired.get(id);
      if (!knownFile) return null;
      try {
        const root = await rootPromise;
        const file = await realpath(knownFile);
        if (
          file !== knownFile ||
          !inside(root, file) ||
          !/\.[jt]sx$/.test(file) ||
          (await stat(file)).size > MAX_SOURCE_BYTES
        )
          return null;
        const code = await readFile(file, "utf8");
        return {
          id: files.get(file) ?? id,
          file,
          path: relative(root, file).replaceAll("\\", "/"),
          code,
        };
      } catch {
        return null;
      }
    },
    async editable(id: string) {
      const registered = sources.get(id);
      if (!registered) return null;
      try {
        const root = await rootPromise;
        const file = await realpath(registered.file);
        if (
          !inside(root, file) ||
          !/\.[jt]sx$/.test(file) ||
          (await stat(file)).size > MAX_SOURCE_BYTES
        )
          return null;
        const code = await readFile(file, "utf8");
        if (hash(code) !== registered.hash) return null;
        return {
          id,
          file,
          path: relative(root, file).replaceAll("\\", "/"),
          code,
        };
      } catch {
        return null;
      }
    },
    async read(
      id: string,
      line: number,
      column: number,
    ): Promise<SourcePreview | null> {
      const registered = sources.get(id);
      if (
        !registered ||
        !Number.isInteger(line) ||
        !Number.isInteger(column) ||
        line < 1 ||
        column < 1
      )
        return null;
      const root = await rootPromise;
      const file = await realpath(registered.file);
      if (
        !inside(root, file) ||
        !/\.[jt]sx$/.test(file) ||
        (await stat(file)).size > MAX_SOURCE_BYTES
      )
        return null;
      const code = await readFile(file, "utf8");
      if (hash(code) !== registered.hash) return null;
      // Match the line terminators used by the JSX transform for source locations.
      const lines = code.split(/\r\n|[\n\r\u2028\u2029]/);
      if (line > lines.length || column > lines[line - 1].length + 1)
        return null;
      const startLine = Math.max(1, line - 20);
      const normalized = file.replaceAll("\\", "/");
      const editorPath = normalized
        .split("/")
        .map((segment, index) =>
          index === 0 && /^[A-Za-z]:$/.test(segment)
            ? segment
            : encodeURIComponent(segment),
        )
        .join("/");
      return {
        path: relative(root, file).replaceAll("\\", "/"),
        code: lines.slice(startLine - 1, line + 30).join("\n"),
        startLine,
        line,
        column,
        editorUrl: `vscode://file/${editorPath.replace(/^\//, "")}:${line}:${column}`,
      };
    },
  };
}
export type SourceRegistry = ReturnType<typeof createSourceRegistry>;
