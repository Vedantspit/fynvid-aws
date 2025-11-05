import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import VideoGrid from "../components/VideoGrid";
import { endpoints } from "../api/client";

export default function History() {
  console.log("History component rendered");

  const { api } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.request("/users/history");
        console.log("History response:", res);

        setVideos(Array.isArray(res?.data) ? res.data : []);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-4">Watch history</div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : videos.length === 0 ? (
        <div className="text-gray-500">
          No watch history yet. Start watching videos!
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
