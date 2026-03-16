import { createConsola } from "consola";

export const log = createConsola({
  fancy: true,
  defaults: {
    tag: "backcap",
  },
});
