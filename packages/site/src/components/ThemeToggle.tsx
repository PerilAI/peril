import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-text-secondary transition-all duration-[var(--duration-normal)] hover:bg-surface-elevated hover:text-text-primary ${isDark ? "rotate-0" : "rotate-180"}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun icon — shown when dark (click to go light) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`absolute h-4 w-4 transition-all duration-[var(--duration-normal)] ${isDark ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        aria-hidden="true"
      >
        <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2Zm0 13a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15Zm-8-5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 2 10Zm13 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 15 10Zm-2.05-4.95a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Zm-7.78 7.78a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0ZM14.95 14.95a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 0 1 1.06-1.06l1.06 1.06a.75.75 0 0 1 0 1.06ZM7.17 7.17a.75.75 0 0 1-1.06 0L5.05 6.11a.75.75 0 0 1 1.06-1.06l1.06 1.06a.75.75 0 0 1 0 1.06ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      </svg>

      {/* Moon icon — shown when light (click to go dark) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`absolute h-4 w-4 transition-all duration-[var(--duration-normal)] ${isDark ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}
