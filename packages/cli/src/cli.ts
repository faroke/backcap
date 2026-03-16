import { defineCommand } from "citty";
import init from "./commands/init.js";
import list from "./commands/list.js";
import add from "./commands/add.js";
import bridges from "./commands/bridges.js";

export const main = defineCommand({
  meta: {
    name: "backcap",
    version: "0.0.1",
    description: "Backcap — capability registry CLI",
  },
  subCommands: {
    init,
    list,
    add,
    bridges,
  },
});
