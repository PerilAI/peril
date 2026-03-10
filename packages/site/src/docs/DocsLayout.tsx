import { useState } from "react";
import { Outlet } from "react-router-dom";
import { MDXProvider } from "@mdx-js/react";
import { DocsHeader } from "./components/DocsHeader";
import { DocsSidebar } from "./components/DocsSidebar";
import { TableOfContents } from "./components/TableOfContents";
import { PrevNextNav } from "./components/PrevNextNav";
import { mdxComponents } from "./components/MDXComponents";

export function DocsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <DocsHeader onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1">
        <DocsSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main
          id="main"
          className="flex flex-1 justify-center overflow-x-hidden"
        >
          <article
            data-docs-content
            className="w-full max-w-[720px] px-6 py-8 lg:px-8"
          >
            <MDXProvider components={mdxComponents}>
              <Outlet />
            </MDXProvider>
            <PrevNextNav />
          </article>
          <TableOfContents />
        </main>
      </div>
    </div>
  );
}
