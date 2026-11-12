import { useState } from "react";
import { Link, useNavigate } from "react-router";
import SearchBar from "../components/SearchBar";
import { useJobs } from "../hooks/useJobs";
import heroImage from "../assets/hero-illustration.svg";

function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { jobs, loading } = useJobs();

  function handleSubmit(event) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
  }

  return (
    <div className="page-content">
      <section className="hero home-hero">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />

        <div className="home-hero-text">
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>
            Find work that feels
            <br />
            <span>like your future.</span>
          </h1>
          <p>
            JobNet collects live internships and vacancies from companies around the
            world. Search, filter, save the ones you like and track the market on the dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            <SearchBar value={query} onChange={setQuery} />
          </form>

          <div className="hero-note">
            <span className="live-dot" />
            {loading ? "Loading fresh opportunities…" : `${jobs.length} opportunities available right now`}
          </div>
        </div>

        <img
          className="home-hero-image"
          src={heroImage}
          alt="Illustration of job cards stacked around a glowing star"
        />
      </section>

      <section className="quick-links">
        <Link className="quick-card" to="/jobs">
          <span className="quick-icon">⌕</span>
          <h3>Browse all jobs</h3>
          <p>Search by title, company or skill with filters and sorting.</p>
        </Link>
        <Link className="quick-card" to="/jobs?type=internship">
          <span className="quick-icon">✦</span>
          <h3>Internships</h3>
          <p>Trainee, graduate and intern positions in one place.</p>
        </Link>
        <Link className="quick-card" to="/jobs?remote=1">
          <span className="quick-icon">⌂</span>
          <h3>Remote only</h3>
          <p>Work from Almaty, Berlin or anywhere in between.</p>
        </Link>
        <Link className="quick-card" to="/dashboard">
          <span className="quick-icon">▤</span>
          <h3>Market dashboard</h3>
          <p>Statistics and breakdowns calculated from live data.</p>
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
