import type { Theme } from "../theme";

const noop = () => {};

export function useTheme() {
  return { theme: "dark" as Theme, setTheme: noop, toggleTheme: noop } as const;
}
