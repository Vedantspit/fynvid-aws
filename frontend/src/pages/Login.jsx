import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-6 rounded-xl shadow space-y-4"
      >
        <div className="text-2xl font-semibold">Login</div>
        <p className="text-sm text-gray-600">Enter email and password.</p>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={loading}
        />
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Password"
          required
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          disabled={loading}
        />
        <button
          disabled={loading}
          className={`w-full px-3 py-2 rounded text-white flex items-center justify-center gap-2 ${
            loading ? "bg-gray-600 cursor-not-allowed" : "bg-gray-900"
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              <span>Logging in...</span>
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
