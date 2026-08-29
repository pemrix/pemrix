# Relay - Next.js

A premium template by [Cruip](https://cruip.com)

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Building for Production

```bash
pnpm build
```

## Search Configuration Fumadocs

### Default (Static Export Compatible)

By default, this template uses **static search** which is compatible with static export. The search uses `staticGET` to generate search indexes at build time that are downloaded by the client when needed.

**How it works:**

- Build time: Search indexes are generated using `staticGET`
- Runtime: Client downloads indexes and uses Orama for client-side search
- Both custom search and native Fumadocs search work with static data
- Compatible with static export (`output: 'export'`)

**Configuration:**

The `RootProvider` in `src/app/layout.tsx` is configured to use static search by default:

```typescript
<RootProvider
  search={{
    options: {
      type: 'static',
    },
  }}
>
```

This ensures the native Fumadocs search dialog (Cmd+K) uses static mode.

### Optional: Server-Side Search (SSR)

You can optionally enable server-side search. **Note: This will prevent static export.**

To enable server-side search:

1. **Update the API route**: Replace the contents of `src/app/api/search/route.ts` with a server-side handler:

   ```typescript
   import { createFromSource } from "fumadocs-core/search/server";
   import { source } from "@/lib/source";

   export const { GET } = createFromSource(source, {
     language: "english",
   });
   ```

2. **Update RootProvider**: In `src/app/layout.tsx`, remove the search options:

   ```typescript
   <RootProvider>{/* Remove search configuration for server-side search */};
   ```

3. **Remove static export**: If you want to use server-side search, you cannot use static export. Remove any `output: 'export'` setting from `next.config.ts`.

### Trade-offs

| Feature               | Static Search (Default)    | Server-Side Search      |
| --------------------- | -------------------------- | ----------------------- |
| Static Export         | ✅ Supported               | ❌ Not supported        |
| Initial Load          | Slower (downloads indexes) | Faster                  |
| Search Performance    | Good                       | Excellent               |
| Hosting Compatibility | Any static host            | Requires Node.js server |

## License

This template is governed by the [Cruip premium license](https://cruip.com/terms/)
