import { Link } from "react-router";

const FEATURES = [
  { icon: "⌕", title: "Search & filters", text: "Search by title, company, location or skill. Filter by type and remote, sort four ways — all synced with the URL." },
  { icon: "♡", title: "Saved jobs", text: "Save vacancies with one click. Your list stays in the browser between visits." },
  { icon: "+", title: "Add your own", text: "Found a vacancy elsewhere? Add it to the board and it gets its own page." },
  { icon: "▤", title: "Dashboard", text: "Live statistics and breakdowns by type, location, company and skills." },
];

const STACK = ["React 19", "React Router", "Vite", "React.lazy + Suspense", "Context API", "Arbeitnow API", "localStorage"];

function AboutPage() {
  return (
    <div className="page-content">
      <section className="page-header">
        <span className="eyebrow">ABOUT THE PROJECT</span>
        <h1 className="page-title">Why JobNet<span className="brand-dot">.</span></h1>
        <p className="page-lead">
          JobNet is a student project that turns a public job-board API into a calm, focused place
          to look for internships and first jobs. It started as a single page and grew into a
          multi-page app with routing, a details page for every vacancy and a dashboard.
        </p>
      </section>

      <section className="about-grid">
        {FEATURES.map((f) => (
          <div className="quick-card" key={f.title}>
            <span className="quick-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="about-columns">
        <div className="facts-card">
          <h3>Tech stack</h3>
          <div className="tag-row">
            {STACK.map((item) => <span className="tag" key={item}>{item}</span>)}
          </div>
        </div>
        <div className="facts-card">
          <h3>Data source</h3>
          <p className="muted">
            Vacancies come from the public{" "}
            <a href="https://www.arbeitnow.com/api/job-board-api" target="_blank" rel="noreferrer">Arbeitnow job board API</a>.
            Nothing is hardcoded — every list, detail page and statistic is built from real API responses.
          </p>
        </div>
      </section>

      <div className="details-nav">
        <Link className="button button-primary" to="/jobs">Start exploring →</Link>
        <Link className="button button-ghost" to="/">Back home</Link>
      </div>
    </div>
  );
}

export default AboutPage;
