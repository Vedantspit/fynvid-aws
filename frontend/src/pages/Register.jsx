import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: "", fullName: "", email: "", password: "", avatarFile: null, coverImageFile: null });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 rounded-xl shadow space-y-4">
        <div className="text-2xl font-semibold">Create account</div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <input className="w-full px-3 py-2 border rounded" placeholder="Username" value={form.userName} onChange={(e)=>setForm({...form, userName: e.target.value})} required />
        <input className="w-full px-3 py-2 border rounded" placeholder="Full name" value={form.fullName} onChange={(e)=>setForm({...form, fullName: e.target.value})} required />
        <input className="w-full px-3 py-2 border rounded" placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required />
        <input className="w-full px-3 py-2 border rounded" placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} required />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Avatar (required)</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-2 pb-2">
                <svg className="w-6 h-6 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-500 text-center px-1">{form.avatarFile ? form.avatarFile.name : "Upload"}</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e)=>setForm({...form, avatarFile: e.target.files?.[0] || null})} required />
            </label>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Cover (optional)</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-2 pb-2">
                <svg className="w-6 h-6 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-500 text-center px-1">{form.coverImageFile ? form.coverImageFile.name : "Upload"}</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e)=>setForm({...form, coverImageFile: e.target.files?.[0] || null})} />
            </label>
          </div>
        </div>
        <button disabled={loading} className={`w-full px-3 py-2 rounded text-white flex items-center justify-center gap-2 ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-gray-900"}`}>
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              <span>Registering...</span>
            </>
          ) : (
            "Register"
          )}
        </button>
      </form>
    </div>
  );
}


