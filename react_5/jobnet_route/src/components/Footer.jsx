import { Link } from "react-router";

function Footer() {
  return (
    <footer className="footer">
      <span>✳ JobNet</span>
      <nav className="footer-links">
        <Link to="/jobs">Jobs</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/about">About</Link>
      </nav>
      <span>Built to help your next chapter begin.</span>
    </footer>
  );
}

export default Footer;
