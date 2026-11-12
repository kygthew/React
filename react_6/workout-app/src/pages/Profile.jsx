import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout, error } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
    }
  };

  const provider = user.providerData[0]?.providerId === "google.com" ? "Google" : "Email/Password";

  return (
    <section className="auth-card">
      <h2>Profile</h2>

      <dl className="profile-info">
        <dt>Email</dt>
        <dd>{user.email}</dd>

        <dt>UID</dt>
        <dd><code>{user.uid}</code></dd>

        <dt>Sign-in method</dt>
        <dd>{provider}</dd>
      </dl>

      {error && <p className="error">{error}</p>}

      <button onClick={handleLogout}>Logout</button>
    </section>
  );
}

export default Profile;
