import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import LikeButton from "../components/LikeButton";
import CommentList from "../components/CommentList";
import PlaylistManager from "../components/PlaylistManager";
import { Link } from "react-router-dom";
export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true; // prevent double fetch in React StrictMode

    (async () => {
      try {
        // Fetch video details and like info in parallel
        const [videoRes, likeRes] = await Promise.all([
          api.request(endpoints.videoById(id)),
          api.request(endpoints.videoLikeInfo(id)).catch(() => null),
        ]);

        const v = videoRes?.data || null;

        if (v && likeRes?.data) {
          v.likesCount =
            typeof likeRes.data.likesCount === "number"
              ? likeRes.data.likesCount
              : 0;
          v.liked = !!likeRes.data.liked;
        }

        setVideo(v);
      } catch (e) {
        setError(e.message);
        setVideo(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!video) return <div className="p-4">{error || "Loading..."}</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-4">
        {video.videoFile ? (
          <video
            src={video.videoFile}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            No video source
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-2xl font-semibold">
          {video.title || "Untitled"}
        </div>

        {user?._id &&
        String(user._id) === String(video?.owner?._id || video?.owner) ? (
          <button
            onClick={async () => {
              try {
                await api.request(endpoints.videoById(video._id), {
                  method: "DELETE",
                });
                navigate("/");
              } catch (e) {
                // ignore
              }
            }}
            className="px-3 py-1.5 rounded border text-sm"
          >
            Delete video
          </button>
        ) : null}
      </div>

      {video?.description ? (
        <div className="mt-2 text-sm text-gray-600 whitespace-pre-line">
          {video.description}
        </div>
      ) : null}

      <div className="mt-2 flex items-center gap-3">
        <div className="text-sm text-gray-500">
          {video?.owner?.userName ? (
            <Link
              to={`/channel/${video?.owner?.userName}`}
              className="hover:underline"
            >
              {video?.owner?.userName}
            </Link>
          ) : (
            <span></span>
          )}
        </div>
        {/* Pass initial like info */}
        <LikeButton
          videoId={video._id}
          initialLiked={video.liked ?? false}
          initialCount={
            typeof video.likesCount === "number" ? video.likesCount : 0
          }
        />
      </div>

      <div className="mt-6">
        <CommentList videoId={video._id} />
      </div>

      <div className="mt-6">
        <PlaylistManager videoId={video._id} />
      </div>
    </div>
  );
}
