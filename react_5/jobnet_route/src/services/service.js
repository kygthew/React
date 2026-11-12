// All API requests live here. Components never call fetch() directly.
const API_URL = "https://www.arbeitnow.com/api/job-board-api";

// In-memory cache: id -> job. Lets the details page open instantly
// when the list was already loaded, and survives route changes.
const jobsCache = new Map();

function normalizeJob(job) {
  return {
    id: job.slug,
    title: job.title || "Untitled position",
    company: job.company_name || "Unknown company",
    location: job.location || "Location not specified",
    remote: Boolean(job.remote),
    tags: Array.isArray(job.tags) ? job.tags : [],
    types: Array.isArray(job.job_types) ? job.job_types : [],
    description: job.description || "No description provided.",
    url: job.url || "",
    createdAt: Number(job.created_at) || 0,
  };
}

async function requestPage(page, signal) {
  const response = await fetch(`${API_URL}?page=${page}`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to load jobs: ${response.status}`);
  }

  const result = await response.json();

  if (!Array.isArray(result.data)) {
    throw new Error("Invalid API response");
  }

  const jobs = result.data.map(normalizeJob);
  jobs.forEach((job) => jobsCache.set(job.id, job));
  return jobs;
}

/** Loads the job board (first page of the API, ~100 vacancies). */
export function fetchJobs(signal) {
  return requestPage(1, signal);
}

/**
 * Finds one vacancy by its id (slug).
 * Arbeitnow has no /jobs/:id endpoint, so we look in the cache first and
 * otherwise walk the API pages until the vacancy is found.
 * Returns null when the id does not exist.
 */
export async function fetchJobById(id, signal, maxPages = 3) {
  if (jobsCache.has(id)) return jobsCache.get(id);

  for (let page = 1; page <= maxPages; page += 1) {
    const jobs = await requestPage(page, signal);
    const found = jobs.find((job) => job.id === id);
    if (found) return found;
    if (jobs.length === 0) break;
  }

  return null;
}
