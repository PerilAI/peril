export interface NavItem {
  title: string;
  path: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", path: "" },
      { title: "Quick Start", path: "quick-start" },
      { title: "Installation", path: "installation" },
    ],
  },
  {
    title: "Core SDK",
    items: [
      { title: "Overview", path: "core/overview" },
      { title: "Capture API", path: "core/capture" },
      { title: "Locators", path: "core/locators" },
    ],
  },
  {
    title: "React Adapter",
    items: [
      { title: "Setup", path: "react/setup" },
      { title: "Components", path: "react/components" },
      { title: "Hooks", path: "react/hooks" },
    ],
  },
  {
    title: "MCP Tools",
    items: [
      { title: "Configuration", path: "mcp/configuration" },
      { title: "Available Tools", path: "mcp/tools" },
      { title: "Agent Integration", path: "mcp/agents" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "REST API", path: "api/rest" },
      { title: "Data Models", path: "api/models" },
    ],
  },
  {
    title: "Troubleshooting",
    items: [{ title: "Common Issues", path: "troubleshooting" }],
  },
];

/** Flattened list for prev/next navigation */
export const flatNavItems: NavItem[] = navigation.flatMap((s) => s.items);

export function getPrevNext(currentPath: string) {
  const idx = flatNavItems.findIndex((item) => item.path === currentPath);
  return {
    prev: idx > 0 ? flatNavItems[idx - 1] : null,
    next: idx < flatNavItems.length - 1 ? flatNavItems[idx + 1] : null,
  };
}
