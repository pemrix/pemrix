import { loader } from "fumadocs-core/source";

import { pemrixDocs } from "@/.source/server";
import { DocsSidebarIcon } from "@/components/docs/docs-icons";

export function getDocsSource() {
  return loader({
    baseUrl: "/docs",
    source: pemrixDocs.toFumadocsSource(),
    icon: (icon) => (icon ? <DocsSidebarIcon icon={icon} /> : null),
  });
}
