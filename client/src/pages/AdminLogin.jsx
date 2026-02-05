import { useState } from "react";
import { api } from "../api.js";
import { setAdminToken } from "../auth.js";

export function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api("/api/admin/login", { method: "POST", body: { username, password } });
      setAdminToken(res.token);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Admin Login</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error ? <div className="error">{error}</div> : null}
        <button className="button" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="muted">Defaults are set from `server/.env` (ADMIN_USERNAME / ADMIN_PASSWORD).</p>
    </div>
  );
}

