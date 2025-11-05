import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";

export default function CommentLikeButton({ commentId, initialLiked = false, initialCount = 0 }) {
  const { api } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.request(endpoints.commentLikeInfo(commentId));
        const info = res?.data || {};
        if (!mounted) return;
        if (typeof info.liked === "boolean") setLiked(info.liked);
        if (typeof info.likesCount === "number") setCount(info.likesCount);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentId]);

  const toggle = async () => {
    try {
      const res = await api.request(endpoints.toggleCommentLike(commentId), { method: "POST" });
      const serverCount = res?.data?.likesCount;
      const serverLiked = res?.data?.liked;
      if (typeof serverLiked === "boolean") setLiked(serverLiked);
      if (typeof serverCount === "number") setCount(serverCount);
      else setCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
    } catch {}
  };

  return (
    <button onClick={toggle} className={`px-2 py-1 rounded border text-sm ${liked ? "bg-gray-900 text-white" : ""}`}>
      👍 {count}
    </button>
  );
}


