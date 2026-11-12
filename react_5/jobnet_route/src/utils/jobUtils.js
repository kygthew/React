export const PAGE_SIZE = 6;

export const TYPE_OPTIONS = [
  { value: "all", label: "All opportunities" },
  { value: "internship", label: "Internships" },
  { value: "full_time", label: "Full-time" },
  { value: "contract", label: "Contract" },
  { value: "part_time", label: "Part-time" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Job title A–Z" },
  { value: "company", label: "Company A–Z" },
];

export function normalizeType(value) {
  return String(value).toLowerCase().trim().replace(/[\s-]+/g, "_");
}

export function isInternship(job) {
  return (
    job.types.some((item) => normalizeType(item).includes("intern")) ||
    /intern|internship|trainee|graduate/i.test(job.title)
  );
}

export function matchesType(job, type) {
  if (type === "all") return true;
  if (type === "internship") return isInternship(job);
  return job.types.map(normalizeType).includes(type);
}

export function filterJobs(jobs, { q = "", type = "all", remote = false, saved = false }, savedIds = []) {
  const query = q.trim().toLowerCase();

  return jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.location} ${job.tags.join(" ")}`.toLowerCase();
    return (
      (!query || text.includes(query)) &&
      matchesType(job, type) &&
      (!remote || job.remote) &&
      (!saved || savedIds.includes(job.id))
    );
  });
}

export function sortJobs(jobs, sort) {
  return [...jobs].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "company") return a.company.localeCompare(b.company);
    if (sort === "oldest") return a.createdAt - b.createdAt;
    return b.createdAt - a.createdAt;
  });
}

export function stripHtml(html = "") {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

export function formatDate(timestamp) {
  return timestamp
    ? new Date(timestamp * 1000).toLocaleDateString()
    : "Date unavailable";
}

export function daysAgo(timestamp) {
  if (!timestamp) return "";
  const days = Math.floor((Date.now() / 1000 - timestamp) / 86400);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function typeLabel(type) {
  const option = TYPE_OPTIONS.find((item) => item.value === normalizeType(type));
  if (option) return option.label;
  return String(type).replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
