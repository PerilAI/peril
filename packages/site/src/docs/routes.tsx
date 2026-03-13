import { lazy, Suspense, type ReactNode } from "react";

// Lazy-load all MDX content pages
const Introduction = lazy(() => import("./content/introduction.mdx"));
const QuickStart = lazy(() => import("./content/quick-start.mdx"));
const Installation = lazy(() => import("./content/installation.mdx"));
const CoreOverview = lazy(() => import("./content/core/overview.mdx"));
const CoreCapture = lazy(() => import("./content/core/capture.mdx"));
const CoreLocators = lazy(() => import("./content/core/locators.mdx"));
const ReactSetup = lazy(() => import("./content/react/setup.mdx"));
const ReactComponents = lazy(() => import("./content/react/components.mdx"));
const ReactHooks = lazy(() => import("./content/react/hooks.mdx"));
const McpConfiguration = lazy(
  () => import("./content/mcp/configuration.mdx"),
);
const McpTools = lazy(() => import("./content/mcp/tools.mdx"));
const McpAgents = lazy(() => import("./content/mcp/agents.mdx"));
const ApiRest = lazy(() => import("./content/api/rest.mdx"));
const ApiModels = lazy(() => import("./content/api/models.mdx"));
const Troubleshooting = lazy(() => import("./content/troubleshooting.mdx"));

function Loading() {
  return (
    <div
      className="flex items-center gap-2 py-12"
      style={{ color: "var(--sf-text-muted)" }}
    >
      <div
        className="h-4 w-4 animate-spin rounded-full"
        style={{
          border: "2px solid rgba(255,255,255,0.06)",
          borderTopColor: "var(--sf-accent)",
        }}
      />
      Loading...
    </div>
  );
}

function Wrap({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export interface DocRoute {
  path: string;
  element: ReactNode;
}

export const docsRoutes: DocRoute[] = [
  { path: "", element: <Wrap><Introduction /></Wrap> },
  { path: "quick-start", element: <Wrap><QuickStart /></Wrap> },
  { path: "installation", element: <Wrap><Installation /></Wrap> },
  { path: "core/overview", element: <Wrap><CoreOverview /></Wrap> },
  { path: "core/capture", element: <Wrap><CoreCapture /></Wrap> },
  { path: "core/locators", element: <Wrap><CoreLocators /></Wrap> },
  { path: "react/setup", element: <Wrap><ReactSetup /></Wrap> },
  { path: "react/components", element: <Wrap><ReactComponents /></Wrap> },
  { path: "react/hooks", element: <Wrap><ReactHooks /></Wrap> },
  { path: "mcp/configuration", element: <Wrap><McpConfiguration /></Wrap> },
  { path: "mcp/tools", element: <Wrap><McpTools /></Wrap> },
  { path: "mcp/agents", element: <Wrap><McpAgents /></Wrap> },
  { path: "api/rest", element: <Wrap><ApiRest /></Wrap> },
  { path: "api/models", element: <Wrap><ApiModels /></Wrap> },
  { path: "troubleshooting", element: <Wrap><Troubleshooting /></Wrap> },
];
