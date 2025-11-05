import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";

export default function LikeButton({
  videoId,
  initialLiked = false,
  initialCount = 0,
}) {
  const { api } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    // derive liked status from liked videos list
    (async () => {
      try {
        const res = await api.request(endpoints.likedVideos());
        const likedIds = Array.isArray(res?.data)
          ? res.data.map((v) => String(v._id))
          : [];
        if (likedIds.includes(String(videoId))) setLiked(true);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const toggle = async () => {
    try {
      const res = await api.request(endpoints.toggleVideoLike(videoId), {
        method: "POST",
      });
      const serverCount = res?.data?.likesCount;
      const serverLiked = res?.data?.liked;
      if (typeof serverLiked === "boolean") setLiked(serverLiked);
      if (typeof serverCount === "number") setCount(serverCount);
      else setCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
    } catch (e) {
      // noop
    }
  };

  return (
    <button
      onClick={toggle}
      className={`px-3 py-1.5 rounded border ${
        liked ? "bg-gray-900 text-white" : ""
      }`}
    >
      👍 {count}
    </button>
  );
}
