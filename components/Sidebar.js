function TagButton({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 ${
        active
          ? 'bg-slate-900 text-white dark:bg-white/90 dark:text-slate-950'
          : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60'
      }`}
    >
      <span className="truncate">{label}</span>
      <span
        className={`ml-3 rounded-md px-2 py-0.5 text-xs ${
          active ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-800'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export default function Sidebar({ tags, activeTag, totalCount, onSelectTag }) {
  return (
    <aside className="hidden md:block md:w-64">
      <div className="sticky top-20 rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="px-3 pb-2 pt-1">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-700">
            Library
          </div>
        </div>

        <div className="space-y-1">
          <TagButton
            active={!activeTag}
            label="All bookmarks"
            count={totalCount}
            onClick={() => onSelectTag?.(null)}
          />
        </div>

        <div className="mt-4 px-3 pb-2 pt-1">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-700">
            Tags
          </div>
        </div>

        <div className="max-h-[50vh] space-y-1 overflow-auto pr-1">
          {tags.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-600">No tags yet</div>
          ) : (
            tags.map((t) => (
              <TagButton
                key={t.tag}
                active={activeTag === t.tag}
                label={t.tag}
                count={t.count}
                onClick={() => onSelectTag?.(t.tag)}
              />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
