import VideoCard from "./VideoCard";

export default function VideoGrid({ videos }) {
  const items = Array.isArray(videos)
    ? videos
    : Array.isArray(videos?.data)
    ? videos.data
    : Array.isArray(videos?.docs)
    ? videos.docs
    : [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((v) => (
        <VideoCard key={v._id || v.id} video={v} />
      ))}
    </div>
  );
}


