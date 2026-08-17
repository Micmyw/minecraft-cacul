import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const [checkout, item, enchantmentsJson, mode = "levels"] = process.argv.slice(2);
if (!checkout || !item || !enchantmentsJson) {
  console.error("Usage: node scripts/run-upstream-baseline.mjs <checkout> <item> '<enchantments-json>' [mode]");
  process.exit(1);
}

const context = vm.createContext({ console, result: null });
vm.runInContext(await readFile(path.join(checkout, "data.js"), "utf8"), context);
vm.runInContext("this.catalog = data", context);
context.postMessage = (message) => {
  context.result = message;
};
vm.runInContext(await readFile(path.join(checkout, "work.js"), "utf8"), context);
context.onmessage({ data: { msg: "set_data", data: context.catalog } });
context.onmessage({
  data: {
    msg: "process",
    item,
    enchants: JSON.parse(enchantmentsJson),
    mode,
  },
});

console.log(JSON.stringify(context.result, null, 2));
