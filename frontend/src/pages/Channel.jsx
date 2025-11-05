import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import SubscribeButton from "../components/SubscribeButton";
import VideoGrid from "../components/VideoGrid";

export default function Channel() {
  const { username } = useParams();
  const { api } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const me = await api.request(`/users/channel/${username}`);
        const ch = me?.data || null;
        setChannel(ch);
        if (ch?._id) {
          const vids = await api.request(
            `${endpoints.videos()}?userId=${ch._id}`
          );
          const data = Array.isArray(vids?.data?.videos)
            ? vids.data.videos
            : Array.isArray(vids?.data)
            ? vids.data
            : [];
          setVideos(data);
        } else {
          setVideos([]);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);
  if (!channel) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4 space-y-6">
      <div className="h-60 md:h-72 rounded-lg bg-gray-200 overflow-hidden">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt="avatar"
              className="w-full h-full object-contain"
            />
          ) : null}
        </div>
        <div className="flex-1">
          <div className="text-2xl font-semibold">{channel.fullName}</div>
          <div className="text-sm text-gray-500">
            @{channel.userName} • {channel.subscribersCount || 0} subscribers
          </div>
        </div>
        <SubscribeButton
          channelId={channel._id}
          initialSubscribed={channel.isSubscribed}
          initialCount={channel.subscribersCount}
          onCountChange={(newCount) =>
            setChannel((prev) => ({ ...prev, subscribersCount: newCount }))
          }
        />
      </div>
      <VideoGrid videos={videos} />
    </div>
  );
}
