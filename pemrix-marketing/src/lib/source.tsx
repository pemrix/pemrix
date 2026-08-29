// .source folder will be generated when you run `next dev`
import { loader } from "fumadocs-core/source";

import { docs } from "@/.source/server";
import { DocsSidebarIcon } from "@/components/docs/docs-icons";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  icon: (icon) => (icon ? <DocsSidebarIcon icon={icon} /> : null),
});
