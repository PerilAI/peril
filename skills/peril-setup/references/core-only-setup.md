# Core-Only Setup (Vanilla JS / Non-React)

If the project doesn't use React, use `@peril/core` directly. This gives you the full capture SDK — screenshots, locators, overlay UI — without any framework dependency.

## Install

```bash
npm install @peril/core @peril/server @peril/mcp
```

## Create the Overlay

```typescript
import { createReviewOverlay } from "@peril/core";

const overlay = createReviewOverlay({
  document,
  window,
  commentComposer: {
    categories: ["bug", "polish", "accessibility", "copy", "ux"],
    severities: ["low", "medium", "high", "critical"],
    onSubmit(submission) {
      // The overlay handles submission to the server internally
      console.log("Review submitted:", submission);
    },
  },
  onSelect(selection) {
    console.log("Element selected:", selection.locators);
  },
  keyboardShortcut: {
    ctrlKey: true,
    shiftKey: true,
    key: "r",
  },
  zIndex: 999999,
});
```

## Toggle Review Mode

```typescript
// Activate
overlay.setEnabled(true);

// Deactivate
overlay.setEnabled(false);

// Check state
const isActive = overlay.isEnabled();

// Clean up when done
overlay.destroy();
```

## Manual Review Submission

If you need more control over the submission process:

```typescript
import {
  captureElementScreenshot,
  capturePageScreenshot,
  generateLocatorBundle,
  submitReview,
} from "@peril/core";

async function captureAndSubmit(element: HTMLElement, comment: string) {
  const locators = generateLocatorBundle(element);
  const elementScreenshot = await captureElementScreenshot(element);
  const pageScreenshot = await capturePageScreenshot({ document, window });
  const rect = element.getBoundingClientRect();

  await submitReview(
    {
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      selection: {
        boundingBox: {
          x: rect.x + window.scrollX,
          y: rect.y + window.scrollY,
          width: rect.width,
          height: rect.height,
        },
        locators,
        domSnippet: element.outerHTML.slice(0, 2048),
      },
      comment: {
        category: "bug",
        severity: "medium",
        text: comment,
        expected: "",
      },
      artifacts: {
        elementScreenshot,
        pageScreenshot,
      },
      metadata: {
        userAgent: navigator.userAgent,
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
        },
        devicePixelRatio: window.devicePixelRatio,
      },
    },
    {
      endpoint: "http://localhost:4173/api/reviews",
    },
  );
}
```

## Integration with Other Frameworks

### Vue 3

Mount the overlay in your root component's `onMounted`:

```typescript
import { onMounted, onUnmounted } from "vue";
import { createReviewOverlay } from "@peril/core";

export default {
  setup() {
    let overlay: ReturnType<typeof createReviewOverlay>;

    onMounted(() => {
      overlay = createReviewOverlay({
        document,
        window,
        commentComposer: { /* ... */ },
      });
    });

    onUnmounted(() => {
      overlay?.destroy();
    });

    return {
      toggleReview: () => overlay?.setEnabled(!overlay.isEnabled()),
    };
  },
};
```

### Svelte

```svelte
<script>
  import { onMount, onDestroy } from "svelte";
  import { createReviewOverlay } from "@peril/core";

  let overlay;

  onMount(() => {
    overlay = createReviewOverlay({
      document,
      window,
      commentComposer: { /* ... */ },
    });
  });

  onDestroy(() => {
    overlay?.destroy();
  });
</script>

<button on:click={() => overlay?.setEnabled(!overlay?.isEnabled())}>
  Toggle Review
</button>
```

### Plain HTML

```html
<script type="module">
  import { createReviewOverlay } from "@peril/core";

  const overlay = createReviewOverlay({
    document,
    window,
    commentComposer: {
      categories: ["bug", "polish", "accessibility", "copy", "ux"],
      severities: ["low", "medium", "high", "critical"],
    },
    keyboardShortcut: { ctrlKey: true, shiftKey: true, key: "r" },
  });
</script>
```
