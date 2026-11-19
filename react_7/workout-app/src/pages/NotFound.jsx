import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>This page does not exist.</p>
      <Link to="/" className="btn-link">Go home</Link>
    </section>
  );
}

export default NotFound;
