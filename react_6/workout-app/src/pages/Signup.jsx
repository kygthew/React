import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password, confirmPassword }) {
  const errors = {};
  if (!EMAIL_REGEX.test(email)) errors.email = "Enter a valid email.";
  if (password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

function Signup() {
  const { signup, loginWithGoogle, error, clearError } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => clearError, []);
  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await signup(form.email, form.password);
    } catch {
      setSubmitting(false);
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
      <h2>Sign up</h2>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
        />
        {fieldErrors.email && <p className="error">{fieldErrors.email}</p>}

        <input
          name="password"
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        {fieldErrors.password && <p className="error">{fieldErrors.password}</p>}

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
        />
        {fieldErrors.confirmPassword && (
          <p className="error">{fieldErrors.confirmPassword}</p>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="divider">or</div>

      <button className="google-button" onClick={handleGoogle} disabled={submitting}>
        Continue with Google
      </button>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default Signup;
