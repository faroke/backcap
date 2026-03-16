import { createRequire } from "node:module";
import { defineCommand } from "citty";
import init from "./commands/init.js";
import list from "./commands/list.js";
import add from "./commands/add.js";
import bridges from "./commands/bridges.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

export const main = defineCommand({
  meta: {
    name: "backcap",
    version,
    description: "Backcap — capability registry CLI",
  },
  subCommands: {
    init,
    list,
    add,
    bridges,
  },
});
