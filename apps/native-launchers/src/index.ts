import { runCliExport } from "../../cli/src/index";

export function runNativeLauncherExport(root: ParentNode): string {
  return runCliExport(root, false);
}
