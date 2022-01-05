import type { SourceMapsPathDescriptor } from "@sentry/cli";
import shelljs from "shelljs";
import { resolve } from "path";

export function toArray(value: any) {
  if (Array.isArray(value) || value === null || value === undefined) {
    return value;
  }
  return [value];
}

export function clearSourceMap(paths: string | SourceMapsPathDescriptor | Array<string | SourceMapsPathDescriptor>, ext: string) {
  if (Array.isArray(paths)) {
    try {
      paths.forEach((path) => {
        (shelljs as any).rm("-r", resolve(process.cwd(), `${path}/**/*${ext}`));
      });
    } catch (error) {
      throw new Error(`删除失败:${error}`);
    }
  }
}
