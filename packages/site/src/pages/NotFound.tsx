import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 pt-16">
      <h1 className="font-display text-6xl text-accent-500">404</h1>
      <p className="mt-4 text-lg text-(--fg-secondary)">
        This page doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-lg border border-(--border) px-6 py-3 text-base font-semibold text-(--fg) transition-all hover:border-accent-500 hover:text-accent-500"
      >
        Back to home
      </Link>
    </section>
  );
}
