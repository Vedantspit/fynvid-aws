import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";

export default function Upload() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", videoFile: null, thumbnail: null });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    if (form.videoFile) fd.append("videoFile", form.videoFile);
    if (form.thumbnail) fd.append("thumbnail", form.thumbnail);
    try {
      await api.request(endpoints.videos(), { method: "POST", body: fd, isForm: true });
      setMsg("Uploaded successfully");
      setForm({ title: "", description: "", videoFile: null, thumbnail: null });
      setTimeout(() => navigate("/"), 1000);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <form onSubmit={submit} className="space-y-4 bg-white border p-4 rounded">
        <div className="text-xl font-semibold">Upload video</div>
        {msg ? <div className={`text-sm ${msg.includes("success") ? "text-green-600" : "text-red-600"}`}>{msg}</div> : null}
        <input className="w-full px-3 py-2 border rounded" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} required />
        <textarea className="w-full px-3 py-2 border rounded" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} rows="3" required />
        <div className="space-y-2">
          <label className="block text-sm font-medium">Video file (required)</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">
                {form.videoFile ? form.videoFile.name : "Click to upload video"}
              </p>
            </div>
            <input type="file" accept="video/*" className="hidden" onChange={(e)=>setForm({...form, videoFile: e.target.files?.[0]||null})} required />
          </label>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Thumbnail (required)</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">
                {form.thumbnail ? form.thumbnail.name : "Click to upload thumbnail"}
              </p>
              {form.thumbnail && (
                <img src={URL.createObjectURL(form.thumbnail)} alt="Preview" className="mt-2 h-16 object-cover rounded" />
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e)=>setForm({...form, thumbnail: e.target.files?.[0]||null})} required />
          </label>
        </div>
        <button disabled={loading} className={`w-full px-3 py-2 rounded text-white flex items-center justify-center gap-2 ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-gray-900"}`}>
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              <span>Uploading...</span>
            </>
          ) : (
            "Upload"
          )}
        </button>
      </form>
    </div>
  );
}


