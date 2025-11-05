import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import { Eye, EyeOff } from "lucide-react"; // 👁️ install with: npm install lucide-react

export default function Settings() {
  const { user, api, setUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState({
    account: false,
    avatar: false,
    cover: false,
    password: false,
  });

  const [msg, setMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const allowPasswordForm = () => setShowForm((prev) => !prev);

  const showMessage = (message) => {
    setMsg(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const saveAccount = async () => {
    setLoading((p) => ({ ...p, account: true }));
    try {
      const res = await api.request("/users/update-account", {
        method: "PATCH",
        body: { fullName, email },
      });
      setUser(res?.data || user);
      showMessage("✅ Account updated successfully!");
    } catch (e) {
      showMessage(`❌ ${e.message}`);
    } finally {
      setLoading((p) => ({ ...p, account: false }));
    }
  };

  const updatePassword = async () => {
    setLoading((p) => ({ ...p, password: true }));
    try {
      await api.request(endpoints.changePassword(), {
        method: "POST",
        body: { password: oldPassword, newPassword },
      });
      setOldPassword("");
      setNewPassword("");
      showMessage("✔️ Password updated successfully!");
    } catch (error) {
      showMessage(`❌ ${error.message}`);
    } finally {
      setLoading((p) => ({ ...p, password: false }));
    }
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setLoading((p) => ({ ...p, avatar: true }));
    const fd = new FormData();
    fd.append("avatar", avatarFile);
    try {
      const res = await api.request("/users/update-avatar", {
        method: "PATCH",
        body: fd,
        isForm: true,
      });
      setUser(res?.data || user);
      showMessage("✔️ Avatar updated successfully!");
      setAvatarFile(null);
    } catch (e) {
      showMessage(`❌ ${e.message}`);
    } finally {
      setLoading((p) => ({ ...p, avatar: false }));
    }
  };

  const saveCover = async () => {
    if (!coverFile) return;
    setLoading((p) => ({ ...p, cover: true }));
    const fd = new FormData();
    fd.append("coverImage", coverFile);
    try {
      const res = await api.request("/users/update-cover", {
        method: "PATCH",
        body: fd,
        isForm: true,
      });
      setUser(res?.data || user);
      showMessage("✔️ Cover image updated successfully!");
      setCoverFile(null);
    } catch (e) {
      showMessage(`❌ ${e.message}`);
    } finally {
      setLoading((p) => ({ ...p, cover: false }));
    }
  };

  return (
    <div className="relative p-4 max-w-2xl space-y-10">
      {/* ✅ Popup Notification */}
      {showPopup && (
        <div className="fixed top-20 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg text-sm animate-fade-in z-50">
          {msg}
        </div>
      )}

      {/* ✅ Account Section */}
      <section className="space-y-3">
        <div className="text-xl font-semibold">Account Details</div>
        <label className="block text-sm text-gray-600">Full Name</label>
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <label className="block text-sm text-gray-600">Email</label>
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={saveAccount}
          disabled={loading.account}
          className={`px-3 py-2 rounded bg-gray-900 text-white flex items-center justify-center gap-2 ${
            loading.account ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading.account && <span className="loader"></span>}
          Save
        </button>
      </section>

      <hr />

      {/* ✅ Password Section */}
      <button
        onClick={allowPasswordForm}
        className="px-3 py-2 rounded bg-gray-900 text-white flex items-center justify-center gap-2"
      >
        {showForm ? "Hide Password Form" : "Change Password"}
      </button>

      {showForm && (
        <section className="space-y-3">
          <div className="text-xl font-semibold">Change Password</div>

          {/* Old Password */}
          <label className="block text-sm text-gray-600">Old Password</label>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded pr-10"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowOldPassword((prev) => !prev)}
            >
              {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* New Password */}
          <label className="block text-sm text-gray-600">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded pr-10"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button
            onClick={updatePassword}
            disabled={loading.password}
            className={`px-3 py-2 rounded bg-gray-900 text-white flex items-center justify-center gap-2 ${
              loading.password ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading.password && <span className="loader"></span>}
            {loading.password ? "Updating..." : "Update Password"}
          </button>
        </section>
      )}

      <hr />

      {/* ✅ Avatar Section */}
      <section className="space-y-3">
        <div className="text-xl font-semibold">Avatar</div>
        <label className="block text-sm text-gray-600">Upload Avatar</label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <p className="text-sm text-gray-500">
              {avatarFile ? avatarFile.name : "Click to upload avatar"}
            </p>
            {avatarFile && (
              <img
                src={URL.createObjectURL(avatarFile)}
                alt="Preview"
                className="mt-2 h-16 w-16 object-cover rounded-full"
              />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
        </label>
        <button
          onClick={saveAvatar}
          disabled={!avatarFile || loading.avatar}
          className={`px-3 py-2 rounded border flex items-center justify-center gap-2 ${
            !avatarFile || loading.avatar ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading.avatar && <span className="loader"></span>}
          Update avatar
        </button>
      </section>

      <hr />

      {/* ✅ Cover Image Section */}
      <section className="space-y-3">
        <div className="text-xl font-semibold">Cover Image</div>
        <label className="block text-sm text-gray-600">
          Upload Cover Image
        </label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <p className="text-sm text-gray-500">
              {coverFile ? coverFile.name : "Click to upload cover image"}
            </p>
            {coverFile && (
              <img
                src={URL.createObjectURL(coverFile)}
                alt="Preview"
                className="mt-2 h-16 object-cover rounded"
              />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
        </label>
        <button
          onClick={saveCover}
          disabled={!coverFile || loading.cover}
          className={`px-3 py-2 rounded border flex items-center justify-center gap-2 ${
            !coverFile || loading.cover ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading.cover && <span className="loader"></span>}
          Update cover
        </button>
      </section>

      {/* ✅ Spinner CSS */}
      <style>{`
        .loader {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #111;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
