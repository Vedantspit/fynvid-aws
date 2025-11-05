import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import { Link } from "react-router-dom";

export default function Subscriptions() {
  const { api, user } = useAuth();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      try {
        const res = await api.request(endpoints.subscribedChannels(user._id));
        setChannels(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch subscribed channels:", err);
      }
    })();
  }, [user?._id, api]);

  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-4">Subscribed channels</div>
      {channels.length === 0 ? (
        <div className="text-gray-500">You haven't subscribed to any channels yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((c) => {
          const username = c.userName || c.username;
          return (
            <Link
              key={c._id}
              to={`/channel/${username}`}
              className="border rounded p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                {c.avatar ? (
                  <img src={c.avatar} alt="avatar" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-sm font-medium text-gray-500">
                    {(c.fullName?.[0] || username?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.fullName || username}</div>
                <div className="text-sm text-gray-500 truncate">@{username}</div>
              </div>
            </Link>
          );
        })}
        </div>
      )}
    </div>
  );
}
