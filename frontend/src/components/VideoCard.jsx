import { Link } from "react-router-dom";

export default function VideoCard({ video }) {
  const thumb = video?.thumbnail || video?.thumbnailUrl || "";
  const title = video?.title || "Untitled";
  const id = video?._id || video?.id;
  const ownerUsername = video?.owner?.userName || video?.owner?.username || video?.ownerName || "";
  const views = typeof video?.views === "number" ? video.views : 0;
  return (
    <div className="group block">
      <Link to={`/watch/${id}`} className="block">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
          {thumb ? (
            <img src={thumb} alt={title} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">No Thumbnail</div>
          )}
        </div>
        <div className="mt-2">
          <div className="font-medium line-clamp-2 group-hover:underline">{title}</div>
        </div>
      </Link>
      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
        {ownerUsername ? (
          <Link to={`/channel/${ownerUsername}`} className="hover:underline">{ownerUsername}</Link>
        ) : (
          <span></span>
        )}
        <span>•</span>
        <span>{views} views</span>
      </div>
    </div>
  );
}


