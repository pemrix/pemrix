import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Only run locale resolution on docs routes and locale-prefixed paths.
  // Marketing pages at the root (e.g. /pricing, /about) are not locale-aware
  // and must not be rewritten to /en/..., which causes 404s.
  matcher: ["/", "/(en|hi|ar)/:path*", "/docs/:path*"],
};
