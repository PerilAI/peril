import type { ListReviewsResponse, Review, ReviewListItem } from "./models.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderPage(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f1e8;
        --panel: rgba(255, 251, 245, 0.9);
        --panel-strong: #fffdf9;
        --border: rgba(40, 30, 18, 0.12);
        --text: #1f1a14;
        --muted: #635849;
        --accent: #b85c38;
        --accent-soft: rgba(184, 92, 56, 0.12);
        --success: #1b6b51;
        --warning: #8d5f0a;
        --danger: #9e2c2c;
        --shadow: 0 20px 60px rgba(41, 28, 16, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(184, 92, 56, 0.18), transparent 28%),
          radial-gradient(circle at top right, rgba(27, 107, 81, 0.14), transparent 24%),
          linear-gradient(180deg, #fdf8f0 0%, var(--bg) 100%);
      }

      a {
        color: inherit;
      }

      .shell {
        width: min(1200px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 32px 0 64px;
      }

      .hero {
        display: flex;
        flex-wrap: wrap;
        align-items: end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
      }

      .eyebrow {
        margin: 0 0 8px;
        color: var(--accent);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1, h2, h3 {
        margin: 0;
        font-weight: 700;
        letter-spacing: -0.03em;
      }

      h1 {
        font-size: clamp(2rem, 5vw, 4rem);
        line-height: 0.96;
      }

      p {
        margin: 0;
        line-height: 1.5;
      }

      .muted {
        color: var(--muted);
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 24px;
        box-shadow: var(--shadow);
        backdrop-filter: blur(18px);
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-bottom: 24px;
      }

      .stat {
        padding: 18px 20px;
      }

      .stat strong {
        display: block;
        font-size: 1.8rem;
        line-height: 1;
      }

      .grid {
        display: grid;
        gap: 16px;
      }

      .review-card {
        display: grid;
        grid-template-columns: minmax(0, 160px) minmax(0, 1fr);
        gap: 18px;
        padding: 18px;
        text-decoration: none;
        transition: transform 120ms ease, border-color 120ms ease, background-color 120ms ease;
      }

      .review-card:hover {
        transform: translateY(-2px);
        border-color: rgba(184, 92, 56, 0.32);
        background: var(--panel-strong);
      }

      .thumb {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: linear-gradient(135deg, rgba(184, 92, 56, 0.08), rgba(27, 107, 81, 0.08));
      }

      .review-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .review-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid var(--border);
        font-size: 0.82rem;
        line-height: 1;
        background: rgba(255, 255, 255, 0.72);
      }

      .badge.status-open,
      .badge.status-in_progress {
        color: var(--warning);
      }

      .badge.status-resolved {
        color: var(--success);
      }

      .badge.status-wont_fix,
      .badge.severity-critical,
      .badge.severity-high {
        color: var(--danger);
      }

      .detail-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
        gap: 20px;
      }

      .detail-main,
      .detail-side {
        display: grid;
        gap: 20px;
      }

      .section {
        padding: 22px;
      }

      .section h2 {
        font-size: 1.35rem;
        margin-bottom: 14px;
      }

      .summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 10px;
      }

      .summary-item {
        padding: 14px;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.56);
      }

      .summary-item span {
        display: block;
        font-size: 0.78rem;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }

      .artifact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 14px;
      }

      figure {
        margin: 0;
      }

      figure img {
        width: 100%;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: #fff;
      }

      figcaption {
        margin-top: 8px;
        color: var(--muted);
        font-size: 0.88rem;
      }

      dl {
        margin: 0;
        display: grid;
        gap: 12px;
      }

      dt {
        font-size: 0.78rem;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 4px;
      }

      dd {
        margin: 0;
      }

      pre {
        margin: 0;
        overflow: auto;
        border-radius: 18px;
        padding: 16px;
        background: #1d1a17;
        color: #f8efe3;
        font-family: "SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 0.88rem;
        line-height: 1.5;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 18px;
        font-weight: 700;
        text-decoration: none;
      }

      .empty-state {
        padding: 28px;
        text-align: center;
      }

      @media (max-width: 860px) {
        .review-card,
        .detail-layout {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

function formatTimestamp(value: string): string {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(timestamp);
}

function formatLocatorSummary(review: ReviewListItem): string {
  return review.locatorSummary || "No locator summary";
}

function renderReviewCard(review: ReviewListItem): string {
  return `<a class="panel review-card" href="/reviews/${encodeURIComponent(review.id)}">
    <img class="thumb" src="/api/reviews/${encodeURIComponent(review.id)}/artifacts/elementScreenshot" alt="">
    <div>
      <div class="review-head">
        <div>
          <p class="eyebrow">${escapeHtml(review.id)}</p>
          <h2>${escapeHtml(review.commentPreview || "Untitled review")}</h2>
        </div>
        <span class="badge status-${escapeHtml(review.status)}">${escapeHtml(review.status)}</span>
      </div>
      <div class="review-meta">
        <span class="badge severity-${escapeHtml(review.severity)}">${escapeHtml(review.severity)}</span>
        <span class="badge">${escapeHtml(review.category)}</span>
        <span class="badge">${escapeHtml(formatLocatorSummary(review))}</span>
      </div>
      <p class="muted">${escapeHtml(review.url)}</p>
      <p class="muted">${escapeHtml(formatTimestamp(review.timestamp))}</p>
    </div>
  </a>`;
}

export function renderDashboardListPage(response: ListReviewsResponse): string {
  const total = response.total;
  const openCount = response.reviews.filter((review) => review.status === "open").length;
  const inProgressCount = response.reviews.filter((review) => review.status === "in_progress").length;
  const resolvedCount = response.reviews.filter((review) => review.status === "resolved").length;
  const cards =
    response.reviews.length > 0
      ? response.reviews.map((review) => renderReviewCard(review)).join("")
      : `<section class="panel empty-state">
          <h2>No reviews yet</h2>
          <p class="muted">Submit a review from the SDK and it will appear here.</p>
        </section>`;

  return renderPage(
    "Peril Review Dashboard",
    `<main class="shell">
      <section class="hero">
        <div>
          <p class="eyebrow">Peril Dashboard</p>
          <h1>Review queue for humans and agents.</h1>
        </div>
        <p class="muted">Inspect every captured issue, open the full annotation, and jump straight to stored artifacts.</p>
      </section>
      <section class="stats">
        <article class="panel stat"><span class="muted">Visible reviews</span><strong>${total}</strong></article>
        <article class="panel stat"><span class="muted">Open</span><strong>${openCount}</strong></article>
        <article class="panel stat"><span class="muted">In progress</span><strong>${inProgressCount}</strong></article>
        <article class="panel stat"><span class="muted">Resolved</span><strong>${resolvedCount}</strong></article>
      </section>
      <section class="grid">${cards}</section>
    </main>`
  );
}

function renderResolution(review: Review): string {
  if (!review.resolution) {
    return `<p class="muted">No resolution recorded.</p>`;
  }

  return `<dl>
    <div>
      <dt>Resolved at</dt>
      <dd>${escapeHtml(formatTimestamp(review.resolution.resolvedAt))}</dd>
    </div>
    <div>
      <dt>Resolved by</dt>
      <dd>${escapeHtml(review.resolution.resolvedBy)}</dd>
    </div>
    <div>
      <dt>Comment</dt>
      <dd>${escapeHtml(review.resolution.comment ?? "No comment")}</dd>
    </div>
  </dl>`;
}

function renderLocators(review: Review): string {
  const { locators } = review.selection;
  const entries = [
    locators.testId ? ["testId", locators.testId] : null,
    locators.role ? ["role", `${locators.role.type} (${locators.role.name})`] : null,
    ["css", locators.css],
    ["xpath", locators.xpath],
    locators.text ? ["text", locators.text] : null
  ].filter((entry): entry is [string, string] => entry !== null);

  return `<dl>${entries
    .map(
      ([label, value]) => `<div>
        <dt>${escapeHtml(label)}</dt>
        <dd><code>${escapeHtml(value)}</code></dd>
      </div>`
    )
    .join("")}</dl>`;
}

function renderStyles(review: Review): string {
  if (!review.selection.computedStyles || Object.keys(review.selection.computedStyles).length === 0) {
    return `<p class="muted">No computed styles captured.</p>`;
  }

  return `<pre>${escapeHtml(JSON.stringify(review.selection.computedStyles, null, 2))}</pre>`;
}

export function renderDashboardDetailPage(review: Review): string {
  return renderPage(
    `Peril Review ${review.id}`,
    `<main class="shell">
      <a class="back-link" href="/">Back to dashboard</a>
      <section class="hero">
        <div>
          <p class="eyebrow">${escapeHtml(review.id)}</p>
          <h1>${escapeHtml(review.comment.text)}</h1>
        </div>
        <div class="review-meta">
          <span class="badge status-${escapeHtml(review.status)}">${escapeHtml(review.status)}</span>
          <span class="badge severity-${escapeHtml(review.comment.severity)}">${escapeHtml(review.comment.severity)}</span>
          <span class="badge">${escapeHtml(review.comment.category)}</span>
        </div>
      </section>
      <section class="detail-layout">
        <div class="detail-main">
          <article class="panel section">
            <h2>Review summary</h2>
            <div class="summary">
              <div class="summary-item"><span>Expected</span>${escapeHtml(review.comment.expected)}</div>
              <div class="summary-item"><span>URL</span>${escapeHtml(review.url)}</div>
              <div class="summary-item"><span>Captured</span>${escapeHtml(formatTimestamp(review.timestamp))}</div>
              <div class="summary-item"><span>Viewport</span>${review.viewport.width} x ${review.viewport.height}</div>
            </div>
          </article>
          <article class="panel section">
            <h2>Artifacts</h2>
            <div class="artifact-grid">
              <figure>
                <img src="/api/reviews/${encodeURIComponent(review.id)}/artifacts/elementScreenshot" alt="Element screenshot for ${escapeHtml(review.id)}">
                <figcaption>Element screenshot</figcaption>
              </figure>
              <figure>
                <img src="/api/reviews/${encodeURIComponent(review.id)}/artifacts/pageScreenshot" alt="Page screenshot for ${escapeHtml(review.id)}">
                <figcaption>Page screenshot</figcaption>
              </figure>
            </div>
          </article>
          <article class="panel section">
            <h2>Selection</h2>
            <dl>
              <div>
                <dt>Bounding box</dt>
                <dd><code>${review.selection.boundingBox.x}, ${review.selection.boundingBox.y}, ${review.selection.boundingBox.width}, ${review.selection.boundingBox.height}</code></dd>
              </div>
            </dl>
            <h3>Locators</h3>
            ${renderLocators(review)}
            <h3>DOM snippet</h3>
            <pre>${escapeHtml(review.selection.domSnippet)}</pre>
          </article>
        </div>
        <aside class="detail-side">
          <article class="panel section">
            <h2>Metadata</h2>
            <dl>
              <div>
                <dt>Reviewer</dt>
                <dd>${escapeHtml(review.metadata.reviewerName ?? "Anonymous")}</dd>
              </div>
              <div>
                <dt>User agent</dt>
                <dd>${escapeHtml(review.metadata.userAgent)}</dd>
              </div>
              <div>
                <dt>Scroll position</dt>
                <dd><code>${review.metadata.scrollPosition.x}, ${review.metadata.scrollPosition.y}</code></dd>
              </div>
              <div>
                <dt>Device pixel ratio</dt>
                <dd>${review.metadata.devicePixelRatio}</dd>
              </div>
            </dl>
          </article>
          <article class="panel section">
            <h2>Resolution</h2>
            ${renderResolution(review)}
          </article>
          <article class="panel section">
            <h2>Computed styles</h2>
            ${renderStyles(review)}
          </article>
        </aside>
      </section>
    </main>`
  );
}

export function renderDashboardNotFoundPage(reviewId: string): string {
  return renderPage(
    "Review not found",
    `<main class="shell">
      <a class="back-link" href="/">Back to dashboard</a>
      <section class="panel empty-state">
        <p class="eyebrow">Missing review</p>
        <h1>${escapeHtml(reviewId)}</h1>
        <p class="muted">This review does not exist in local storage.</p>
      </section>
    </main>`
  );
}
