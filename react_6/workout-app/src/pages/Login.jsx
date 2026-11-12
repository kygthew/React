import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login, loginWithGoogle, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => clearError, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      // GuestRoute redirects automatically once the user is signed in
    } catch {
      setSubmitting(false); // error message comes from AuthContext
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-card">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>
      </form>

      <div className="divider">or</div>

      <button className="google-button" onClick={handleGoogle} disabled={submitting}>
        Continue with Google
      </button>

      <p className="auth-switch">
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </section>
  );
}

export default Login;
