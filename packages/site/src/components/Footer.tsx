export function Footer() {
  return (
    <footer className="border-t border-(--border-subtle) py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-(--fg-muted)">
            <span
              className="inline-block h-4 w-4 rounded bg-accent-500"
              aria-hidden="true"
            />
            Peril
          </div>
          <p className="text-sm text-(--fg-muted)">
            Visual feedback your agents understand.
          </p>
        </div>
      </div>
    </footer>
  );
}
