import { useSearchParams } from "react-router";
import { SORT_OPTIONS, TYPE_OPTIONS } from "../utils/jobUtils";

const DEFAULTS = {
  q: "",
  type: "all",
  remote: false,
  sort: "newest",
  page: 1,
  saved: false,
};

/**
 * Keeps the Jobs page filters in the URL:
 * /jobs?q=react&type=internship&remote=1&sort=title&page=2&saved=1
 * Refresh, shared links and browser Back/Forward all restore the same view.
 */
export function useJobFilters() {
  const [params, setParams] = useSearchParams();

  const rawType = params.get("type");
  const rawSort = params.get("sort");

  const filters = {
    q: params.get("q") ?? DEFAULTS.q,
    type: TYPE_OPTIONS.some((o) => o.value === rawType) ? rawType : DEFAULTS.type,
    remote: params.get("remote") === "1",
    sort: SORT_OPTIONS.some((o) => o.value === rawSort) ? rawSort : DEFAULTS.sort,
    page: Math.max(1, Number.parseInt(params.get("page"), 10) || 1),
    saved: params.get("saved") === "1",
  };

  /**
   * update({ type: "contract" }) — changes the given keys.
   * Any filter change returns the list to page 1.
   * Default values are removed so the URL stays clean.
   */
  function update(changes, { replace = false } = {}) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        Object.entries(changes).forEach(([key, value]) => {
          if (value === DEFAULTS[key] || value === "" || value === false) {
            next.delete(key);
          } else {
            next.set(key, value === true ? "1" : String(value));
          }
        });

        if (!("page" in changes)) next.delete("page");
        return next;
      },
      { replace }
    );
  }

  function reset() {
    setParams({});
  }

  return { filters, update, reset };
}
