import {
  createReviewOverlay,
  captureElementScreenshot,
  capturePageScreenshot,
  generateLocatorBundle,
  submitReview,
  type ReviewOverlayController,
  type ReviewCommentSubmission,
} from "@peril-ai/core";

let overlay: ReviewOverlayController | null = null;

/**
 * Initialize the Peril review overlay.
 *
 * Press Ctrl+Shift+. to toggle review mode. Click any element to select it,
 * fill out the comment form, and the review (with screenshots, locators, and
 * metadata) is submitted to the local @peril-ai/server instance.
 */
export function initPeril(): ReviewOverlayController {
  if (overlay) {
    return overlay;
  }

  overlay = createReviewOverlay({
    commentComposer: {
      onSubmit: (submission) => {
        void handleSubmission(submission);
      },
    },
  });

  return overlay;
}

async function handleSubmission(
  submission: ReviewCommentSubmission
): Promise<void> {
  const { comment, selection } = submission;

  try {
    const [elementScreenshot, pageScreenshot] = await Promise.all([
      captureElementScreenshot(selection.element),
      capturePageScreenshot(),
    ]);

    const locators = generateLocatorBundle(selection.element);

    await submitReview({
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      selection: {
        boundingBox: selection.boundingBox,
        locators,
        domSnippet: selection.element.outerHTML.slice(0, 2048),
      },
      comment,
      artifacts: {
        elementScreenshot,
        pageScreenshot,
      },
      metadata: {
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
        },
      },
    });

    console.log("[peril] Review submitted successfully.");
  } catch (error) {
    console.error("[peril] Failed to submit review:", error);
  }
}
