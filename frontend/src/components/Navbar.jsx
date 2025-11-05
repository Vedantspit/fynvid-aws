import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold">
          YT Clone
        </Link>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link to="/upload" className="px-3 py-1.5 rounded bg-gray-900 text-white">Upload</Link>
              <button onClick={async () => { await logout(); navigate("/login"); }} className="px-3 py-1.5 rounded border">Logout</button>
              <Link to={`/channel/${user?.userName || user?.username || user?._id}`} className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-medium">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-contain" />
                ) : (
                  (user?.fullName?.[0] || "U")
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 rounded border">Login</Link>
              <Link to="/register" className="px-3 py-1.5 rounded bg-gray-900 text-white">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


