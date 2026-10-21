
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Job list pages">
      <button
        className="page-button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        ←
      </button>

      <span className="page-indicator">
        <strong>{page}</strong> / {totalPages}
      </span>

      <button
        className="page-button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        →
      </button>
    </nav>
  );
}

export default Pagination;
