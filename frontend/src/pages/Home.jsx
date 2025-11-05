import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoGrid from "../components/VideoGrid";

export default function Home() {
  const { api } = useAuth();
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const res = await api.request(endpoints.videos());
        setVideos(res?.data?.videos || res?.data || []);
      } catch (e) {
        setError(e.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="p-4">
      {error ? <div className="text-red-600 mb-4">{error}</div> : null}
      {videos.length == 0 ? (
        <h2 className="text-gray-600 text-center text-xl mt-8">
          No videos found
        </h2>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
