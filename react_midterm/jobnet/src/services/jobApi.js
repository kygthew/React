
const API_URL = "https://www.arbeitnow.com/api/job-board-api";

export async function fetchJobs(signal) {
  const response = await fetch(API_URL, { signal });

  if (!response.ok) {
    throw new Error(`Failed to load jobs: ${response.status}`);
  }

  const result = await response.json();

  if (!Array.isArray(result.data)) {
    throw new Error("Invalid API response");
  }

  return result.data.map((job) => ({
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
  }));
}
