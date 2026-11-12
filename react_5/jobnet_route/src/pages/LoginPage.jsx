import { useState } from "react";
import { Link } from "react-router";

/** Styled placeholder — real authentication will be added later. */
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }
    setMessage("Authentication is coming soon — for now you can use JobNet without an account.");
  }

  return (
    <div className="page-content login-page">
      <form className="job-form login-card" onSubmit={handleSubmit}>
        <div className="form-heading">
          <div>
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Log in to JobNet</h2>
          </div>
          <span className="brand-icon">✳</span>
        </div>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" autoComplete="current-password" />
        </label>

        {message && <p className="form-note" role="status">{message}</p>}

        <button className="button button-primary form-submit" type="submit">Log in →</button>

        <p className="muted login-footer">
          No account yet? Sign-up is on the way. Meanwhile, <Link to="/jobs">browse jobs</Link>.
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
