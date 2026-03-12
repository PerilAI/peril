import { useEffect, useRef, useState } from "react";
import {
  buildPlaygroundOutputLines,
  createDefaultDraft,
  createFallbackAnnotation,
  getPlaygroundIssue,
  initialPlaygroundIssueId,
  playgroundIssues,
  type PlaygroundAnnotationDraft,
  type PlaygroundAnnotationOutput
} from "./annotationPlaygroundData";
import { generatePlaygroundLocatorBundle } from "./annotationPlaygroundLocators";
import { trackDemoInteraction } from "../analytics";

interface ComposerPosition {
  left: number;
  top: number;
}

export function AnnotationPlayground() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const issueElementsRef = useRef<Record<string, HTMLElement | null>>({});
  const [activeIssueId, setActiveIssueId] = useState<string>(initialPlaygroundIssueId);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerPosition, setComposerPosition] = useState<ComposerPosition>({
    left: 24,
    top: 24
  });
  const [draft, setDraft] = useState<PlaygroundAnnotationDraft>(() =>
    createDefaultDraft(initialPlaygroundIssueId)
  );
  const [submittedAnnotation, setSubmittedAnnotation] = useState<PlaygroundAnnotationOutput>(() =>
    createFallbackAnnotation(initialPlaygroundIssueId)
  );

  useEffect(() => {
    syncAnnotation(initialPlaygroundIssueId);
  }, []);

  useEffect(() => {
    function handleResize() {
      syncAnnotation(submittedAnnotation.issueId, false);

      if (isComposerOpen) {
        updateComposerPosition(activeIssueId);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIssueId, isComposerOpen, submittedAnnotation.issueId]);

  const visibleIssueId = isComposerOpen ? activeIssueId : submittedAnnotation.issueId;
  const outputLines = buildPlaygroundOutputLines(submittedAnnotation);

  function setIssueElement(issueId: string, element: HTMLElement | null) {
    issueElementsRef.current[issueId] = element;
  }

  function handleIssueClick(issueId: string) {
    setActiveIssueId(issueId);
    setDraft(createDefaultDraft(issueId));
    setIsComposerOpen(true);
    updateComposerPosition(issueId);
    trackDemoInteraction("started");
  }

  function handleSubmit() {
    syncAnnotation(activeIssueId, true, draft);
    setIsComposerOpen(false);
    trackDemoInteraction("completed");
  }

  function syncAnnotation(
    issueId: string,
    shouldUpdateSelection = true,
    nextDraft = createDefaultDraft(issueId)
  ) {
    const issue = getPlaygroundIssue(issueId);
    const targetElement = issueElementsRef.current[issueId];
    const frameElement = frameRef.current;

    if (!targetElement || !frameElement) {
      setSubmittedAnnotation(createFallbackAnnotation(issueId, nextDraft));
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const frameRect = frameElement.getBoundingClientRect();
    const locators = generatePlaygroundLocatorBundle(targetElement);

    setSubmittedAnnotation({
      boundingBox: {
        x: round(targetRect.left - frameRect.left),
        y: round(targetRect.top - frameRect.top),
        width: round(targetRect.width),
        height: round(targetRect.height)
      },
      category: nextDraft.category,
      comment: nextDraft.comment,
      elementType: issue.elementType,
      expected: nextDraft.expected,
      issueId: issue.id,
      issueLabel: issue.label,
      locators,
      severity: nextDraft.severity,
      screenshotRef: issue.screenshotRef,
      summary: issue.summary,
      url: "http://localhost:3000/dashboard"
    });

    if (shouldUpdateSelection) {
      updateComposerPosition(issueId);
    }
  }

  function updateComposerPosition(issueId: string) {
    const frameElement = frameRef.current;
    const targetElement = issueElementsRef.current[issueId];

    if (!frameElement || !targetElement) {
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const frameRect = frameElement.getBoundingClientRect();
    const frameWidth = frameRect.width;
    const relativeLeft = targetRect.left - frameRect.left;
    const relativeTop = targetRect.bottom - frameRect.top + 14;

    const width = frameWidth < 720 ? frameWidth - 32 : 320;
    const maxLeft = Math.max(16, frameWidth - width - 16);

    setComposerPosition({
      left: frameWidth < 720 ? 16 : clamp(round(relativeLeft), 16, round(maxLeft)),
      top: frameWidth < 720 ? round(frameRect.height - 172) : clamp(round(relativeTop), 16, round(frameRect.height - 188))
    });
  }

  return (
    <section
      id="get-started"
      className="relative overflow-hidden border-t border-border-subtle px-6 py-24"
      aria-labelledby="annotation-playground-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_38%),radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.07),_transparent_32%)]" />
      <div className="relative mx-auto max-w-[var(--container-max)]">
        <div className="mx-auto max-w-[42rem] text-center">
          <p className="text-caption font-medium uppercase tracking-[var(--tracking-wider)] text-accent">
            Interactive demo
          </p>
          <h2
            id="annotation-playground-heading"
            className="mt-4 font-display text-h1 leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-text-primary"
          >
            Try it yourself
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-body-lg leading-[var(--leading-relaxed)] text-text-secondary">
            Click any element below. A lightweight review composer opens inline,
            and the payload on the right updates with the locator bundle your
            agent would receive.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.95fr)]">
          <div
            ref={frameRef}
            className="relative overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
          >
            <div className="flex items-center gap-3 border-b border-border-subtle bg-bg/80 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-dot-close" />
                <span className="h-3 w-3 rounded-full bg-dot-minimize" />
                <span className="h-3 w-3 rounded-full bg-dot-expand" />
              </div>
              <div className="ml-3 flex-1 rounded-full border border-border-subtle bg-surface-elevated px-4 py-2 text-sm text-text-muted">
                localhost:3000/dashboard
              </div>
              <span className="hidden rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-caption uppercase tracking-[var(--tracking-wider)] text-accent md:inline-flex">
                Live playground
              </span>
            </div>

            <div className="grid gap-6 p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-bg/50 px-4 py-3">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-text-secondary" aria-label="Sample dashboard navigation">
                  {playgroundIssues
                    .filter((issue) => issue.id === "nav-align")
                    .map((issue) => (
                      <button
                        key={issue.id}
                        ref={(element) => setIssueElement(issue.id, element)}
                        type="button"
                        data-issue-id={issue.id}
                        data-testid={issue.testId}
                        aria-label={issue.role.name}
                        onClick={() => handleIssueClick(issue.id)}
                        className={getInteractiveClassName(visibleIssueId === issue.id, "translate-y-[2px]")}
                      >
                        {issue.label}
                      </button>
                    ))}
                  <button
                    type="button"
                    className="rounded-full px-3 py-2 text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
                  >
                    Activity
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-3 py-2 text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
                  >
                    Deploys
                  </button>
                </nav>
                <div className="rounded-full border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-text-muted">
                  12 open reviews
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)]">
                <div className="rounded-2xl border border-border-subtle bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
                  <p className="text-caption uppercase tracking-[var(--tracking-wider)] text-text-muted">
                    Current sprint
                  </p>
                  <h3 className="mt-3 text-h3 text-text-primary">
                    Reduce feedback loops from hours to minutes
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                    Sample dashboard for the embedded demo. Click the highlighted
                    problem spots to create a review.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {playgroundIssues
                      .filter((issue) => issue.id === "cta-wrap")
                      .map((issue) => (
                        <button
                          key={issue.id}
                          ref={(element) => setIssueElement(issue.id, element)}
                          type="button"
                          data-issue-id={issue.id}
                          data-testid={issue.testId}
                          onClick={() => handleIssueClick(issue.id)}
                          className={getInteractiveClassName(
                            visibleIssueId === issue.id,
                            "max-w-[11.75rem] text-left leading-5"
                          )}
                        >
                          <span className="block w-[7.2rem] sm:w-auto">{issue.label}</span>
                        </button>
                      ))}
                    <button
                      type="button"
                      className="rounded-full border border-border-subtle px-4 py-3 text-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
                    >
                      Watch walkthrough
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {playgroundIssues
                    .filter((issue) => issue.id === "card-padding")
                    .map((issue) => (
                      <button
                        key={issue.id}
                        ref={(element) => setIssueElement(issue.id, element)}
                        type="button"
                        data-issue-id={issue.id}
                        data-testid={issue.testId}
                        aria-label={issue.role.name}
                        onClick={() => handleIssueClick(issue.id)}
                        className={getInteractiveClassName(
                          visibleIssueId === issue.id,
                          "flex flex-col items-start rounded-2xl border border-border-subtle bg-surface-elevated px-4 py-3 text-left"
                        )}
                      >
                        <span className="text-caption uppercase tracking-[var(--tracking-wider)] text-text-muted">
                          {issue.label}
                        </span>
                        <span className="mt-2 text-3xl font-semibold text-text-primary">84%</span>
                        <span className="mt-1 text-sm leading-6 text-text-secondary">
                          of issues annotated before standup
                        </span>
                      </button>
                    ))}

                  <div className="rounded-2xl border border-border-subtle bg-bg/55 px-4 py-4">
                    <p className="text-caption uppercase tracking-[var(--tracking-wider)] text-text-muted">
                      Invite a reviewer
                    </p>
                    <div className="mt-3">
                      <label
                        htmlFor="playground-share-link"
                        className="text-sm text-text-secondary"
                      >
                        Share review link
                      </label>
                      {playgroundIssues
                        .filter((issue) => issue.id === "input-copy")
                        .map((issue) => (
                          <input
                            key={issue.id}
                            id="playground-share-link"
                            ref={(element) => setIssueElement(issue.id, element)}
                            data-issue-id={issue.id}
                            data-testid={issue.testId}
                            aria-label={issue.role.name}
                            onClick={() => handleIssueClick(issue.id)}
                            readOnly
                            value="preview-url"
                            className={`${getInteractiveClassName(
                              visibleIssueId === issue.id,
                              "mt-3 w-full cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary"
                            )} focus:outline-none`}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isComposerOpen ? (
              <div
                className="absolute z-20 w-[min(20rem,calc(100%-2rem))] rounded-2xl border border-accent/40 bg-bg/96 p-4 shadow-[0_20px_48px_rgba(0,0,0,0.45)] backdrop-blur-md"
                style={{
                  left: `${composerPosition.left}px`,
                  top: `${composerPosition.top}px`
                }}
              >
                <p className="text-caption uppercase tracking-[var(--tracking-wider)] text-accent">
                  Reviewing {getPlaygroundIssue(activeIssueId).headline}
                </p>
                <label className="mt-3 block text-sm text-text-secondary">
                  Comment
                  <textarea
                    value={draft.comment}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        comment: event.target.value
                      }))
                    }
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text-primary"
                  />
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm text-text-secondary">
                    Category
                    <select
                      value={draft.category}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          category: event.target.value as PlaygroundAnnotationDraft["category"]
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary"
                    >
                      <option value="bug">Bug</option>
                      <option value="polish">Polish</option>
                      <option value="accessibility">Accessibility</option>
                      <option value="copy">Copy</option>
                      <option value="ux">UX</option>
                    </select>
                  </label>
                  <label className="text-sm text-text-secondary">
                    Severity
                    <select
                      value={draft.severity}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          severity: event.target.value as PlaygroundAnnotationDraft["severity"]
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </label>
                </div>
                <label className="mt-3 block text-sm text-text-secondary">
                  Expected outcome
                  <input
                    value={draft.expected}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        expected: event.target.value
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary"
                  />
                </label>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsComposerOpen(false); trackDemoInteraction("abandoned"); }}
                    className="text-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg shadow-glow-sm transition-all duration-[var(--duration-fast)] hover:bg-accent-hover hover:shadow-glow-md"
                  >
                    Submit annotation
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="playground-panel-enter rounded-2xl border border-border bg-bg p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
              <div>
                <p className="text-caption uppercase tracking-[var(--tracking-wider)] text-accent">
                  Structured payload
                </p>
                <h3 className="mt-2 text-h4 text-text-primary">
                  {submittedAnnotation.issueLabel}
                </h3>
              </div>
              <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-caption uppercase tracking-[var(--tracking-wider)] text-accent">
                live locator output
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-text-secondary">
              {submittedAnnotation.summary}
            </p>

            <ol className="mt-6 space-y-3 font-mono text-[var(--text-small)] leading-6">
              {outputLines.map((line, index) => (
                <li
                  key={`${submittedAnnotation.issueId}-${line.id}-${submittedAnnotation.comment}`}
                  className="playground-output-line rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-text-secondary">{line.label}</span>
                  <span className="text-text-muted">: </span>
                  <span className={getLineValueClassName(line.kind)}>{line.value}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-xl border border-border-subtle bg-surface/60 p-4">
              <p className="text-caption uppercase tracking-[var(--tracking-wider)] text-text-muted">
                Why this matters
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Peril carries the click target, structured comment, locator
                bundle, and artifact reference together so an agent can fix the
                issue without a second round of human explanation.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function getInteractiveClassName(isActive: boolean, extraClassName = ""): string {
  return [
    "rounded-xl border transition-all duration-[var(--duration-fast)]",
    isActive
      ? "border-accent bg-accent/10 text-text-primary shadow-glow-md"
      : "border-transparent bg-transparent text-text-secondary hover:border-accent/40 hover:bg-accent/6 hover:text-text-primary hover:shadow-glow-sm",
    extraClassName
  ]
    .filter(Boolean)
    .join(" ");
}

function getLineValueClassName(kind: "accent" | "primary" | "secondary"): string {
  switch (kind) {
    case "accent":
      return "text-accent";
    case "secondary":
      return "text-text-secondary";
    default:
      return "text-text-primary";
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number): number {
  return Math.round(value);
}
