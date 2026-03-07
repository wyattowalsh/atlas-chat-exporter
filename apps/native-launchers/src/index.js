import { runCliExport } from "../../cli/src/index";
export function runNativeLauncherExport(root) {
    return runCliExport(root, false);
}
