import { useCallback, useEffect, useMemo, useState } from "react";
import { JobsContext } from "./JobsContext";
import { fetchJobs } from "../services/service";
import { useLocalStorage } from "../hooks/useLocalStorage";

/**
 * Shared app data: API vacancies, vacancies added by the user,
 * and saved (♥) ids. Loaded once and shared by every page,
 * so moving between routes does not refetch the list.
 */
function JobsProvider({ children }) {
  const [apiJobs, setApiJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [customJobs, setCustomJobs] = useLocalStorage("jobnet-custom-jobs", []);
  const [savedIds, setSavedIds] = useLocalStorage("jobnest-saved", []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJobs() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchJobs(controller.signal);
        if (!controller.signal.aborted) setApiJobs(data);
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError("We couldn't load the vacancies. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadJobs();
    return () => controller.abort();
  }, [reloadKey]);

  const jobs = useMemo(() => [...customJobs, ...apiJobs], [customJobs, apiJobs]);

  const toggleSaved = useCallback(
    (id) =>
      setSavedIds((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      ),
    [setSavedIds]
  );

  const addJob = useCallback(
    (job) => setCustomJobs((current) => [job, ...current]),
    [setCustomJobs]
  );

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const value = useMemo(
    () => ({ jobs, customJobs, loading, error, reload, savedIds, toggleSaved, addJob }),
    [jobs, customJobs, loading, error, reload, savedIds, toggleSaved, addJob]
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export default JobsProvider;
