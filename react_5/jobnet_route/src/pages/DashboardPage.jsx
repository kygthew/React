import { useMemo, useState } from "react";
import { Link } from "react-router";
import StatePanel from "../components/StatePanel";
import { useJobs } from "../hooks/useJobs";
import { TYPE_OPTIONS, isInternship, matchesType, daysAgo } from "../utils/jobUtils";

const MODES = [
  { value: "all", label: "All" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
];

function countBy(items, getKey) {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    if (key) map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function BarRow({ label, count, max, to }) {
  const width = max ? Math.max(4, Math.round((count / max) * 100)) : 0;
  return (
    <Link className="bar-row" to={to}>
      <span className="bar-label">{label}</span>
      <span className="bar-track">
        <span className="bar-fill" style={{ width: `${width}%` }} />
      </span>
      <span className="bar-value">{count}</span>
    </Link>
  );
}

function DashboardPage() {
  const { jobs, loading, error, reload, savedIds } = useJobs();
  const [mode, setMode] = useState("all");
  const [type, setType] = useState("all");

  // Query string that sends the user to the Jobs page with the same filters
  const baseParams = useMemo(() => {
    const params = new URLSearchParams();
    if (mode === "remote") params.set("remote", "1");
    if (type !== "all") params.set("type", type);
    return params;
  }, [mode, type]);

  function jobsLink(extra = {}) {
    const params = new URLSearchParams(baseParams);
    Object.entries(extra).forEach(([key, value]) => params.set(key, value));
    const qs = params.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  }

  const scoped = useMemo(
    () =>
      jobs.filter(
        (job) =>
          (mode === "all" || (mode === "remote" ? job.remote : !job.remote)) &&
          matchesType(job, type)
      ),
    [jobs, mode, type]
  );

  const stats = useMemo(() => {
    const now = Date.now() / 1000;
    const total = scoped.length;
    const remote = scoped.filter((job) => job.remote).length;
    const companies = new Set(scoped.map((job) => job.company)).size;
    const thisWeek = scoped.filter((job) => job.createdAt && now - job.createdAt <= 7 * 86400).length;
    const internships = scoped.filter(isInternship).length;
    const saved = scoped.filter((job) => savedIds.includes(job.id)).length;

    const byType = TYPE_OPTIONS.filter((o) => o.value !== "all")
      .map((o) => ({ ...o, count: scoped.filter((job) => matchesType(job, o.value)).length }))
      .sort((a, b) => b.count - a.count);

    const byLocation = countBy(scoped, (job) => job.location).slice(0, 6);
    const byTag = countBy(scoped.flatMap((job) => job.tags), (tag) => tag).slice(0, 10);
    const topCompanies = countBy(scoped, (job) => job.company).slice(0, 5);
    const latest = [...scoped].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    return {
      total, remote, companies, thisWeek, internships, saved,
      remoteShare: total ? Math.round((remote / total) * 100) : 0,
      byType, byLocation, byTag, topCompanies, latest,
    };
  }, [scoped, savedIds]);

  if (loading) {
    return (
      <div className="page-content">
        <StatePanel spinner title="Crunching the numbers..." text="Loading live job listings." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <StatePanel title="Something went wrong" text={error}>
          <button className="button button-primary" onClick={reload}>Try again</button>
        </StatePanel>
      </div>
    );
  }

  const typeMax = Math.max(...stats.byType.map((t) => t.count), 0);
  const locationMax = stats.byLocation[0]?.[1] ?? 0;
  const companyMax = stats.topCompanies[0]?.[1] ?? 0;

  return (
    <div className="page-content">
      <section className="page-header">
        <span className="eyebrow">MARKET OVERVIEW</span>
        <div className="section-heading">
          <h1 className="page-title">Dashboard<span className="brand-dot">.</span></h1>
          <Link className="button button-ghost" to={jobsLink()}>Open these jobs →</Link>
        </div>
        <p className="page-lead">Statistics are calculated live from the API response. Use the filters to focus on a segment.</p>
      </section>

      <section className="filter-panel dashboard-filters">
        <div className="filter-group">
          <span className="filter-label">WORK MODE</span>
          <div className="segmented" role="group" aria-label="Work mode">
            {MODES.map((m) => (
              <button
                key={m.value}
                className={`segment ${mode === m.value ? "segment-active" : ""}`}
                onClick={() => setMode(m.value)}
                aria-pressed={mode === m.value}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">OPPORTUNITY</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button className="button button-ghost" onClick={() => { setMode("all"); setType("all"); }}>
          Reset ↺
        </button>
      </section>

      <section className="stats-grid">
        <Link className="stat-card" to={jobsLink()}>
          <span className="stat-label">Open positions</span>
          <strong className="stat-value">{stats.total}</strong>
          <span className="stat-note">in the current selection</span>
        </Link>
        <Link className="stat-card" to={jobsLink({ remote: "1" })}>
          <span className="stat-label">Remote share</span>
          <strong className="stat-value">{stats.remoteShare}%</strong>
          <span className="stat-note">{stats.remote} remote positions</span>
        </Link>
        <div className="stat-card">
          <span className="stat-label">Companies hiring</span>
          <strong className="stat-value">{stats.companies}</strong>
          <span className="stat-note">unique employers</span>
        </div>
        <Link className="stat-card" to={jobsLink({ sort: "newest" })}>
          <span className="stat-label">New this week</span>
          <strong className="stat-value">{stats.thisWeek}</strong>
          <span className="stat-note">posted in the last 7 days</span>
        </Link>
        <Link className="stat-card" to={jobsLink({ type: "internship" })}>
          <span className="stat-label">Internships</span>
          <strong className="stat-value">{stats.internships}</strong>
          <span className="stat-note">intern, trainee & graduate</span>
        </Link>
        <Link className="stat-card" to="/jobs?saved=1">
          <span className="stat-label">Saved by you</span>
          <strong className="stat-value">{stats.saved}</strong>
          <span className="stat-note">of {savedIds.length} saved in total</span>
        </Link>
      </section>

      {stats.total === 0 ? (
        <StatePanel title="No data for this selection" text="Try another work mode or opportunity type." />
      ) : (
        <section className="breakdown-grid">
          <div className="breakdown-card">
            <h3>By job type</h3>
            {stats.byType.map((t) => (
              <BarRow key={t.value} label={t.label} count={t.count} max={typeMax} to={jobsLink({ type: t.value })} />
            ))}
          </div>

          <div className="breakdown-card">
            <h3>Top locations</h3>
            {stats.byLocation.map(([loc, count]) => (
              <BarRow key={loc} label={loc} count={count} max={locationMax} to={jobsLink({ q: loc })} />
            ))}
          </div>

          <div className="breakdown-card">
            <h3>Top companies</h3>
            {stats.topCompanies.map(([company, count]) => (
              <BarRow key={company} label={company} count={count} max={companyMax} to={jobsLink({ q: company })} />
            ))}
          </div>

          <div className="breakdown-card">
            <h3>Popular skills & tags</h3>
            <div className="tag-row">
              {stats.byTag.length > 0 ? stats.byTag.map(([tag, count]) => (
                <Link className="tag tag-link" key={tag} to={jobsLink({ q: tag })}>
                  {tag} · {count}
                </Link>
              )) : <span className="muted">No tags in this selection</span>}
            </div>
          </div>

          <div className="breakdown-card breakdown-wide">
            <h3>Latest vacancies</h3>
            <ul className="latest-list">
              {stats.latest.map((job) => (
                <li key={job.id}>
                  <Link to={`/jobs/${encodeURIComponent(job.id)}`}>
                    <span className="latest-title">{job.title}</span>
                    <span className="latest-meta">{job.company} · {job.location} · {daysAgo(job.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export default DashboardPage;
