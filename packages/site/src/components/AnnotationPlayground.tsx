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
import { useInView } from "../hooks/useInView";

interface ComposerPosition {
  left: number;
  top: number;
}

export function AnnotationPlayground() {
  const [sectionRef, inView] = useInView(0.1);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const issueElementsRef = useRef<Record<string, HTMLElement | null>>({});
  const glowedRef = useRef(false);
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

  // Glow-pulse the first clickable element 500ms after entering viewport
  useEffect(() => {
    if (!inView || glowedRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    glowedRef.current = true;
    const firstEl = issueElementsRef.current[initialPlaygroundIssueId];
    if (!firstEl) return;

    const timeout = setTimeout(() => {
      firstEl.style.animation = "glow-pulse-once 2s ease-in-out 1";
      const cleanup = () => {
        firstEl.style.animation = "";
        firstEl.removeEventListener("animationend", cleanup);
      };
      firstEl.addEventListener("animationend", cleanup);
    }, 500);
    return () => clearTimeout(timeout);
  }, [inView]);

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
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative overflow-hidden px-[var(--sf-container-gutter)]"
      style={{ paddingTop: "var(--sf-section-padding)", paddingBottom: "var(--sf-section-padding)", borderTop: "1px solid rgba(255,255,255,0.04)" }}
      aria-labelledby="annotation-playground-heading"
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--sf-gradient-glow)" }} />
      <div className="relative mx-auto max-w-[var(--sf-container-wide)]">
        <div
          className="max-w-[42rem]"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(12px)",
            transition:
              "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <p
            className="uppercase font-medium"
            style={{
              fontFamily: "var(--sf-font-mono)",
              fontSize: "var(--sf-text-caption)",
              letterSpacing: "var(--sf-tracking-overline)",
              color: "var(--sf-text-accent)",
            }}
          >
            Interactive demo
          </p>
          <h2
            id="annotation-playground-heading"
            className="mt-4 font-display font-[800]"
            style={{
              fontSize: "var(--sf-text-h1)",
              lineHeight: "var(--sf-leading-h1)",
              letterSpacing: "var(--sf-tracking-h1)",
              color: "var(--sf-text-primary)",
            }}
          >
            Try it yourself
          </h2>
          <p
            className="mt-5 max-w-2xl"
            style={{
              fontSize: "var(--sf-text-body-lg)",
              lineHeight: "var(--sf-leading-body)",
              color: "var(--sf-text-secondary)",
            }}
          >
            Click any element below. A lightweight review composer opens inline,
            and the payload on the right updates with the locator bundle your
            agent would receive.
          </p>
        </div>

        <noscript>
          <div className="mt-12 rounded-2xl p-8 text-center" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "var(--sf-bg-surface)" }}>
            <p style={{ fontSize: "var(--sf-text-body-lg)", color: "var(--sf-text-secondary)" }}>
              The interactive annotation playground requires JavaScript.
              Enable JavaScript to try clicking elements and see the
              structured payload Peril sends to your coding agent.
            </p>
          </div>
        </noscript>

        <div
          className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.95fr)]"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms",
          }}
        >
          <div
            ref={frameRef}
            className="sf-card-theater relative overflow-hidden"
          >
            <div className="sf-glass-strong flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", borderRadius: 0 }}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-dot-close" />
                <span className="h-3 w-3 rounded-full bg-dot-minimize" />
                <span className="h-3 w-3 rounded-full bg-dot-expand" />
              </div>
              <div className="ml-3 flex-1 rounded-full px-4 py-2 text-sm" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "var(--sf-bg-elevated)", color: "var(--sf-text-muted)" }}>
                localhost:3000/dashboard
              </div>
              <span className="hidden rounded-full px-3 py-1 uppercase md:inline-flex" style={{ border: "1px solid rgba(245,158,11,0.3)", background: "var(--sf-accent-muted)", fontSize: "var(--sf-text-caption)", letterSpacing: "var(--sf-tracking-overline)", color: "var(--sf-text-accent)" }}>
                Live playground
              </span>
            </div>

            <div className="grid gap-6 p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "var(--sf-bg-elevated)" }}>
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
                <div className="rounded-full px-3 py-2 text-sm" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "var(--sf-bg-elevated)", color: "var(--sf-text-muted)" }}>
                  12 open reviews
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)]">
                <div className="rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "var(--sf-bg-surface)" }}>
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
                      className="rounded-full px-4 py-3 text-sm transition-colors duration-[var(--duration-fast)] hover:text-[var(--sf-text-primary)]"
                      style={{ border: "1px solid rgba(255,255,255,0.04)", color: "var(--sf-text-secondary)" }}
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
                          "flex flex-col items-start rounded-2xl px-4 py-3 text-left"
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

                  <div className="rounded-2xl px-4 py-4" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(6,6,14,0.55)" }}>
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
                              "mt-3 w-full cursor-pointer rounded-xl px-4 py-3 text-sm"
                            )} focus:outline-none`}
                            style={{ background: "var(--sf-bg-surface)", color: "var(--sf-text-secondary)" }}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isComposerOpen ? (
              <div
                className="sf-glass absolute z-20 w-[min(20rem,calc(100%-2rem))] rounded-2xl p-4 shadow-[0_20px_48px_rgba(0,0,0,0.45)]"
                style={{
                  borderColor: "rgba(245,158,11,0.4)",
                  left: `${composerPosition.left}px`,
                  top: `${composerPosition.top}px`,
                }}
              >
                <p className="uppercase" style={{ fontSize: "var(--sf-text-caption)", letterSpacing: "var(--sf-tracking-overline)", color: "var(--sf-text-accent)" }}>
                  Reviewing {getPlaygroundIssue(activeIssueId).headline}
                </p>
                <label className="mt-3 block text-sm" style={{ color: "var(--sf-text-secondary)" }}>
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
                    className="mt-2 w-full resize-none rounded-xl px-3 py-3 text-sm"
                    style={{ border: "1px solid rgba(255,255,255,0.06)", background: "var(--sf-bg-surface)", color: "var(--sf-text-primary)" }}
                  />
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm" style={{ color: "var(--sf-text-secondary)" }}>
                    Category
                    <select
                      value={draft.category}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          category: event.target.value as PlaygroundAnnotationDraft["category"]
                        }))
                      }
                      className="mt-2 w-full rounded-lg px-3 py-2.5 text-sm"
                      style={{ border: "1px solid rgba(255,255,255,0.06)", background: "var(--sf-bg-surface)", color: "var(--sf-text-primary)" }}
                    >
                      <option value="bug">Bug</option>
                      <option value="polish">Polish</option>
                      <option value="accessibility">Accessibility</option>
                      <option value="copy">Copy</option>
                      <option value="ux">UX</option>
                    </select>
                  </label>
                  <label className="text-sm" style={{ color: "var(--sf-text-secondary)" }}>
                    Severity
                    <select
                      value={draft.severity}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          severity: event.target.value as PlaygroundAnnotationDraft["severity"]
                        }))
                      }
                      className="mt-2 w-full rounded-lg px-3 py-2.5 text-sm"
                      style={{ border: "1px solid rgba(255,255,255,0.06)", background: "var(--sf-bg-surface)", color: "var(--sf-text-primary)" }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </label>
                </div>
                <label className="mt-3 block text-sm" style={{ color: "var(--sf-text-secondary)" }}>
                  Expected outcome
                  <input
                    value={draft.expected}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        expected: event.target.value
                      }))
                    }
                    className="mt-2 w-full rounded-lg px-3 py-2.5 text-sm"
                    style={{ border: "1px solid rgba(255,255,255,0.06)", background: "var(--sf-bg-surface)", color: "var(--sf-text-primary)" }}
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

          <aside className="sf-card playground-panel-enter rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <p className="uppercase" style={{ fontSize: "var(--sf-text-caption)", letterSpacing: "var(--sf-tracking-overline)", color: "var(--sf-text-accent)" }}>
                  Structured payload
                </p>
                <h3 className="mt-2" style={{ fontSize: "var(--sf-text-h3)", color: "var(--sf-text-primary)" }}>
                  {submittedAnnotation.issueLabel}
                </h3>
              </div>
              <div className="rounded-full px-3 py-1 uppercase" style={{ border: "1px solid rgba(245,158,11,0.2)", background: "var(--sf-accent-muted)", fontSize: "var(--sf-text-caption)", letterSpacing: "var(--sf-tracking-overline)", color: "var(--sf-text-accent)" }}>
                live locator output
              </div>
            </div>

            <p className="mt-4 text-sm leading-6" style={{ color: "var(--sf-text-secondary)" }}>
              {submittedAnnotation.summary}
            </p>

            <ol className="mt-6 space-y-3 leading-6" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-small)" }}>
              {outputLines.map((line, index) => (
                <li
                  key={`${submittedAnnotation.issueId}-${line.id}-${submittedAnnotation.comment}`}
                  className="playground-output-line rounded-lg px-3 py-2"
                  style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(16,16,28,0.5)", animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-text-secondary">{line.label}</span>
                  <span className="text-text-muted">: </span>
                  <span className={getLineValueClassName(line.kind)}>{line.value}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(10,10,20,0.6)" }}>
              <p className="uppercase" style={{ fontSize: "var(--sf-text-caption)", letterSpacing: "var(--sf-tracking-overline)", color: "var(--sf-text-muted)" }}>
                Why this matters
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--sf-text-secondary)" }}>
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
