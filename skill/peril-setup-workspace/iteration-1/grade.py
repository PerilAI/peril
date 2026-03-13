#!/usr/bin/env python3
"""Grade all eval runs against assertions."""

import json
import os
import glob

BASE = os.path.dirname(os.path.abspath(__file__))


def read_file(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        return None


def file_exists_in(project_dir, pattern):
    """Check if any file matching pattern exists under project_dir."""
    for root, dirs, files in os.walk(project_dir):
        for f in files:
            full = os.path.join(root, f)
            if pattern in full:
                return True
    return False


def file_contains(project_dir, filename_pattern, text_pattern):
    """Check if any file matching filename_pattern contains text_pattern."""
    for root, dirs, files in os.walk(project_dir):
        for f in files:
            if filename_pattern in f:
                content = read_file(os.path.join(root, f))
                if content and text_pattern in content:
                    return True
    return False


def any_file_contains(project_dir, text_pattern):
    """Check if any file in the project contains the text."""
    for root, dirs, files in os.walk(project_dir):
        if 'node_modules' in root:
            continue
        for f in files:
            content = read_file(os.path.join(root, f))
            if content and text_pattern in content:
                return True
    return False


def grade_react_setup(run_dir):
    project = os.path.join(run_dir, "project")
    summary = read_file(os.path.join(run_dir, "outputs", "summary.md")) or ""
    results = []

    # installs-all-packages
    has_all = all(
        pkg in summary
        for pkg in ["@peril/core", "@peril/react", "@peril/server", "@peril/mcp"]
    )
    results.append({
        "text": "Install command includes @peril/core, @peril/react, @peril/server, and @peril/mcp",
        "passed": has_all,
        "evidence": "All 4 packages found in summary" if has_all else "Missing packages in summary",
    })

    # wraps-with-review-provider
    app_tsx = read_file(os.path.join(project, "src", "App.tsx")) or ""
    has_provider = "ReviewProvider" in app_tsx
    results.append({
        "text": "App.tsx wraps content with <ReviewProvider> component",
        "passed": has_provider,
        "evidence": f"ReviewProvider {'found' if has_provider else 'not found'} in App.tsx",
    })

    # review-provider-has-server-url
    has_url = "serverUrl" in app_tsx
    results.append({
        "text": "ReviewProvider has serverUrl prop pointing to the Peril backend",
        "passed": has_url,
        "evidence": f"serverUrl prop {'found' if has_url else 'not found'} in App.tsx",
    })

    # gitignore-peril-dir
    gitignore = read_file(os.path.join(project, ".gitignore")) or ""
    has_peril = ".peril" in gitignore
    results.append({
        "text": ".gitignore includes .peril/ directory",
        "passed": has_peril,
        "evidence": f".peril {'found' if has_peril else 'not found'} in .gitignore",
    })

    # mcp-config-created
    has_mcp = (
        file_exists_in(project, "mcp.json")
        or file_exists_in(project, ".mcp.json")
    )
    results.append({
        "text": "An MCP configuration file is created for an agent",
        "passed": has_mcp,
        "evidence": f"MCP config file {'found' if has_mcp else 'not found'}",
    })

    # review-mode-toggle
    has_toggle = any_file_contains(project, "useReviewMode")
    results.append({
        "text": "A review mode toggle is added using useReviewMode hook",
        "passed": has_toggle,
        "evidence": f"useReviewMode {'found' if has_toggle else 'not found'} in project files",
    })

    return results


def grade_mcp_config(run_dir):
    project = os.path.join(run_dir, "project")
    summary = read_file(os.path.join(run_dir, "outputs", "summary.md")) or ""
    results = []

    # cursor-mcp-config-created
    cursor_mcp = read_file(os.path.join(project, ".cursor", "mcp.json"))
    results.append({
        "text": "Creates .cursor/mcp.json config file for Cursor",
        "passed": cursor_mcp is not None,
        "evidence": f".cursor/mcp.json {'exists' if cursor_mcp else 'does not exist'}",
    })

    # config-has-peril-entry
    has_peril_entry = False
    if cursor_mcp:
        try:
            cfg = json.loads(cursor_mcp)
            servers = cfg.get("mcpServers", {})
            if "peril" in servers:
                srv = servers["peril"]
                has_peril_entry = (
                    srv.get("command") == "npx"
                    and any("@peril/mcp" in a or "peril-mcp" in a for a in srv.get("args", []))
                )
        except json.JSONDecodeError:
            pass
    results.append({
        "text": "MCP config contains a 'peril' server entry with npx @peril/mcp",
        "passed": has_peril_entry,
        "evidence": f"peril entry {'valid' if has_peril_entry else 'invalid or missing'}",
    })

    # does-not-modify-app
    original_app = '''import { useState } from "react";
import { ReviewProvider } from "@peril/react";
import { useReviewMode } from "@peril/react";

function ReviewButton() {
  const { active, toggle } = useReviewMode();
  return (
    <button onClick={toggle}>
      {active ? "Exit Review" : "Review Mode"}
    </button>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <ReviewProvider serverUrl="http://localhost:4173/api" captureScreenshots={true}>
      <div className="app">
        <ReviewButton />
        <h1>My App</h1>
        <button onClick={() => setCount((c) => c + 1)}>
          Count: {count}
        </button>
      </div>
    </ReviewProvider>
  );
}

export default App;'''
    current_app = read_file(os.path.join(project, "src", "App.tsx")) or ""
    # Normalize whitespace for comparison
    unchanged = current_app.strip() == original_app.strip()
    results.append({
        "text": "Does NOT modify App.tsx since it's already configured",
        "passed": unchanged,
        "evidence": f"App.tsx {'unchanged' if unchanged else 'was modified'}",
    })

    # does-not-reinstall
    no_install = not any(
        cmd in summary.lower()
        for cmd in ["npm install", "pnpm add", "yarn add", "bun add"]
    )
    results.append({
        "text": "Does NOT run npm install since packages are already installed",
        "passed": no_install,
        "evidence": f"Install command {'not found' if no_install else 'found'} in summary",
    })

    return results


def grade_vanilla_js(run_dir):
    project = os.path.join(run_dir, "project")
    summary = read_file(os.path.join(run_dir, "outputs", "summary.md")) or ""
    results = []

    # installs-core-not-react — check package.json (not summary, which may mention @peril/react in prose)
    pkg = read_file(os.path.join(project, "package.json")) or ""
    pkg_has_core = "@peril/core" in pkg
    pkg_no_react = "@peril/react" not in pkg
    passed = pkg_has_core and pkg_no_react
    results.append({
        "text": "Installs @peril/core but NOT @peril/react",
        "passed": passed,
        "evidence": f"core={'yes' if pkg_has_core else 'no'}, react={'absent' if pkg_no_react else 'present'}",
    })

    # uses-create-review-overlay
    has_overlay = any_file_contains(project, "createReviewOverlay")
    results.append({
        "text": "Uses createReviewOverlay from @peril/core to set up the overlay",
        "passed": has_overlay,
        "evidence": f"createReviewOverlay {'found' if has_overlay else 'not found'} in source",
    })

    # gitignore-peril-dir
    gitignore = read_file(os.path.join(project, ".gitignore")) or ""
    has_peril = ".peril" in gitignore
    results.append({
        "text": ".gitignore includes .peril/ directory",
        "passed": has_peril,
        "evidence": f".peril {'found' if has_peril else 'not found'} in .gitignore",
    })

    # mcp-config-created
    has_mcp = (
        file_exists_in(project, "mcp.json")
        or file_exists_in(project, ".mcp.json")
    )
    results.append({
        "text": "An MCP configuration file is created",
        "passed": has_mcp,
        "evidence": f"MCP config {'found' if has_mcp else 'not found'}",
    })

    # no-react-imports
    no_react_import = not any_file_contains(project, "from \"@peril/react\"") and not any_file_contains(project, "from '@peril/react'")
    results.append({
        "text": "No files import from @peril/react or use ReviewProvider",
        "passed": no_react_import,
        "evidence": f"@peril/react imports {'absent' if no_react_import else 'found'}",
    })

    return results


# Grade all runs
evals = [
    ("react-app-setup", grade_react_setup),
    ("mcp-config-only", grade_mcp_config),
    ("vanilla-js-setup", grade_vanilla_js),
]

for eval_name, grader in evals:
    for variant in ["with_skill", "without_skill"]:
        run_dir = os.path.join(BASE, eval_name, variant)
        if not os.path.isdir(run_dir):
            continue
        results = grader(run_dir)
        grading = {
            "eval_name": eval_name,
            "variant": variant,
            "expectations": results,
            "pass_rate": sum(1 for r in results if r["passed"]) / len(results) if results else 0,
        }
        out_path = os.path.join(run_dir, "grading.json")
        with open(out_path, "w") as f:
            json.dump(grading, f, indent=2)

        passed = sum(1 for r in results if r["passed"])
        total = len(results)
        print(f"{eval_name}/{variant}: {passed}/{total} ({grading['pass_rate']:.0%})")
        for r in results:
            status = "PASS" if r["passed"] else "FAIL"
            print(f"  [{status}] {r['text']}")
            print(f"         {r['evidence']}")
