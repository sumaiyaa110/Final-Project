type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

// Page numbers to show: first, last and two either side of the current page.
function visiblePages(page: number, totalPages: number): (number | "gap")[] {
  const pages: (number | "gap")[] = [];

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap");
    }
  }

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pager" aria-label="Pagination">
      <button
        type="button"
        className="pager-button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        ←
      </button>

      {visiblePages(page, totalPages).map((p, index) =>
        p === "gap" ? (
          <span key={`gap-${index}`} className="pager-gap">
            …
          </span>
        ) : (
          <button
            type="button"
            key={p}
            className={`pager-button ${p === page ? "active" : ""}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className="pager-button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}
