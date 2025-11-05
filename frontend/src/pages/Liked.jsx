import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoGrid from "../components/VideoGrid";

export default function Liked() {
  const { api } = useAuth();
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.request(endpoints.likedVideos());
        setVideos(res?.data || []);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-4">Liked videos</div>
      <VideoGrid videos={videos} />
    </div>
  );
}


