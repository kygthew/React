import { Link, useLocation } from "react-router";

function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="page-content">
      <section className="hero not-found">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <span className="eyebrow">ERROR 404</span>
        <h1>
          This page took
          <br />
          <span>another career path.</span>
        </h1>
        <p>
          We couldn't find <code>{pathname}</code>. The link may be broken or the page was moved.
        </p>
        <div className="details-nav">
          <Link className="button button-primary" to="/">Go home</Link>
          <Link className="button button-ghost" to="/jobs">Browse jobs</Link>
        </div>
      </section>
    </div>
  );
}

export default NotFoundPage;
