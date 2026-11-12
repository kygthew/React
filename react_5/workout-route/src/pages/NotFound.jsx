import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>No such page</p>
      <Link to="/" className="btn-link">GO to main</Link>
    </section>
  );
}

export default NotFound;
