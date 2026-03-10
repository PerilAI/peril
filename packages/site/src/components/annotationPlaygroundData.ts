import type { PlaygroundLocatorBundle } from "./annotationPlaygroundLocators";

export interface PlaygroundIssue {
  id: string;
  headline: string;
  label: string;
  summary: string;
  category: "bug" | "polish" | "accessibility" | "copy" | "ux";
  severity: "low" | "medium" | "high" | "critical";
  defaultComment: string;
  defaultExpected: string;
  elementType: string;
  testId: string;
  role: {
    type: string;
    name: string;
  };
  text: string;
  screenshotRef: string;
}

export interface PlaygroundAnnotationDraft {
  category: PlaygroundIssue["category"];
  comment: string;
  expected: string;
  severity: PlaygroundIssue["severity"];
}

export interface PlaygroundAnnotationOutput {
  boundingBox: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  category: PlaygroundIssue["category"];
  comment: string;
  elementType: string;
  expected: string;
  issueId: string;
  issueLabel: string;
  locators: PlaygroundLocatorBundle;
  severity: PlaygroundIssue["severity"];
  screenshotRef: string;
  summary: string;
  url: string;
}

export interface PlaygroundOutputLine {
  id: string;
  kind: "accent" | "primary" | "secondary";
  label: string;
  value: string;
}

export const playgroundUrl = "http://localhost:3000/dashboard";

export const playgroundIssues: PlaygroundIssue[] = [
  {
    id: "cta-wrap",
    headline: "Primary action",
    label: "Ship feedback faster",
    summary: "CTA wraps awkwardly at tablet widths.",
    category: "ux",
    severity: "high",
    defaultComment: "CTA wraps awkwardly at tablet widths. Keep the action on one line.",
    defaultExpected: "The primary action stays on one line and aligns with the supporting copy.",
    elementType: "button",
    testId: "demo-ship-feedback",
    role: {
      type: "button",
      name: "Ship feedback faster"
    },
    text: "Ship feedback faster",
    screenshotRef: "playground://artifacts/cta-wrap/element.png"
  },
  {
    id: "nav-align",
    headline: "Navigation item",
    label: "Inbox",
    summary: "Inbox label sits low compared with the rest of the nav.",
    category: "polish",
    severity: "medium",
    defaultComment: "Inbox label sits a few pixels low compared with the other tabs.",
    defaultExpected: "All navigation labels share the same baseline and hover rhythm.",
    elementType: "button",
    testId: "demo-nav-inbox",
    role: {
      type: "button",
      name: "Inbox"
    },
    text: "Inbox",
    screenshotRef: "playground://artifacts/nav-align/element.png"
  },
  {
    id: "card-padding",
    headline: "Insight card",
    label: "Open review rate",
    summary: "This card has tighter padding than the others.",
    category: "polish",
    severity: "medium",
    defaultComment: "This card feels compressed compared with the surrounding metrics.",
    defaultExpected: "Use the same internal spacing as the neighboring insight cards.",
    elementType: "article",
    testId: "demo-review-rate-card",
    role: {
      type: "article",
      name: "Open review rate"
    },
    text: "Open review rate 84% of issues annotated before standup",
    screenshotRef: "playground://artifacts/card-padding/element.png"
  },
  {
    id: "input-copy",
    headline: "Invite form",
    label: "Share review link",
    summary: "Placeholder copy is too vague for a first-time reviewer.",
    category: "copy",
    severity: "medium",
    defaultComment: "Placeholder copy is vague. Tell the reviewer what link belongs here.",
    defaultExpected: "The input explains that this should be a staging or preview URL.",
    elementType: "input",
    testId: "demo-share-link-input",
    role: {
      type: "textbox",
      name: "Share review link"
    },
    text: "Share review link",
    screenshotRef: "playground://artifacts/input-copy/element.png"
  }
];

export const initialPlaygroundIssueId = "cta-wrap";

export function createDefaultDraft(issueId: string): PlaygroundAnnotationDraft {
  const issue = getPlaygroundIssue(issueId);

  return {
    category: issue.category,
    comment: issue.defaultComment,
    expected: issue.defaultExpected,
    severity: issue.severity
  };
}

export function createFallbackAnnotation(
  issueId: string,
  draft = createDefaultDraft(issueId)
): PlaygroundAnnotationOutput {
  const issue = getPlaygroundIssue(issueId);

  return {
    boundingBox: {
      x: issueId === "cta-wrap" ? 44 : 24,
      y: issueId === "cta-wrap" ? 232 : 96,
      width: issueId === "input-copy" ? 304 : 220,
      height: issueId === "input-copy" ? 52 : 56
    },
    category: draft.category,
    comment: draft.comment,
    elementType: issue.elementType,
    expected: draft.expected,
    issueId: issue.id,
    issueLabel: issue.label,
    locators: {
      testId: issue.testId,
      role: issue.role,
      css: `[data-testid="${issue.testId}"]`,
      xpath: `//*[@data-testid="${issue.testId}"]`,
      text: issue.text
    },
    severity: draft.severity,
    screenshotRef: issue.screenshotRef,
    summary: issue.summary,
    url: playgroundUrl
  };
}

export function buildPlaygroundOutputLines(
  annotation: PlaygroundAnnotationOutput
): PlaygroundOutputLine[] {
  return [
    {
      id: "url",
      kind: "primary",
      label: "url",
      value: annotation.url
    },
    {
      id: "element",
      kind: "primary",
      label: "selection.elementType",
      value: annotation.elementType
    },
    {
      id: "bbox",
      kind: "secondary",
      label: "selection.boundingBox",
      value: JSON.stringify(annotation.boundingBox)
    },
    {
      id: "testId",
      kind: "accent",
      label: "selection.locators.testId",
      value: annotation.locators.testId ?? "n/a"
    },
    {
      id: "role",
      kind: "accent",
      label: "selection.locators.role",
      value: annotation.locators.role
        ? `${annotation.locators.role.type}[name="${annotation.locators.role.name}"]`
        : "n/a"
    },
    {
      id: "css",
      kind: "accent",
      label: "selection.locators.css",
      value: annotation.locators.css
    },
    {
      id: "xpath",
      kind: "accent",
      label: "selection.locators.xpath",
      value: annotation.locators.xpath
    },
    {
      id: "comment",
      kind: "primary",
      label: "comment.text",
      value: annotation.comment
    },
    {
      id: "expected",
      kind: "primary",
      label: "comment.expected",
      value: annotation.expected
    },
    {
      id: "category",
      kind: "secondary",
      label: "comment.category",
      value: annotation.category
    },
    {
      id: "severity",
      kind: "secondary",
      label: "comment.severity",
      value: annotation.severity
    },
    {
      id: "artifact",
      kind: "accent",
      label: "artifacts.elementScreenshot",
      value: annotation.screenshotRef
    }
  ];
}

export function getPlaygroundIssue(issueId: string): PlaygroundIssue {
  const issue = playgroundIssues.find((candidate) => candidate.id === issueId);

  if (!issue) {
    throw new Error(`Unknown playground issue: ${issueId}`);
  }

  return issue;
}
