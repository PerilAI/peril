export interface HeroMessage {
  accent: string;
  description: string;
  headline: string;
}

export const defaultHeroMessage: HeroMessage = {
  headline: "Visual feedback your agents understand",
  accent: "agents",
  description:
    "Click any element, leave a comment, and your coding agent gets structured locators, screenshots, and context via MCP."
};

const referralHeroMessages: Record<string, HeroMessage> = {
  "cursor.sh": {
    headline: "Works with Cursor",
    accent: "Cursor",
    description:
      "Capture feedback in the browser and hand structured locators, screenshots, and context back to Cursor through MCP."
  },
  "anthropic.com": {
    headline: "Works with Claude Code",
    accent: "Claude Code",
    description:
      "Capture feedback in the browser and hand structured locators, screenshots, and context back to Claude Code through MCP."
  },
  "github.com": {
    headline: "Works with your favorite editor",
    accent: "favorite editor",
    description:
      "Capture feedback in the browser and move from visual feedback to structured tasks in the editor workflow your team already uses."
  }
};

export function getHeroMessageFromReferrer(referrer: string): HeroMessage {
  const hostname = parseReferrerHostname(referrer);

  if (!hostname) {
    return defaultHeroMessage;
  }

  for (const [domain, message] of Object.entries(referralHeroMessages)) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      return message;
    }
  }

  return defaultHeroMessage;
}

function parseReferrerHostname(referrer: string): string | null {
  if (!referrer) {
    return null;
  }

  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}
