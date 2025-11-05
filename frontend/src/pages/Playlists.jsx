import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import VideoCard from "../components/VideoCard";

export default function Playlists() {
  const { api, user } = useAuth();
  const [lists, setLists] = useState([]);
  const [openId, setOpenId] = useState("");

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      try {
        const res = await api.request(endpoints.playlistsByUser(user._id));
        setLists(
          Array.isArray(res?.data) ? res.data : res?.data?.playlists || []
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user?._id]);

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;
    try {
      await api.request(endpoints.deletePlaylist(playlistId), {
        method: "DELETE",
      });
      setLists((prev) => prev.filter((p) => p._id !== playlistId));
    } catch (error) {
      console.error("Failed to delete playlist:", error);
    }
  };
  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-4">Your playlists</div>

      {lists.length === 0 ? (
        <div className="flex justify-center mt-8">
          <h2 className="text-gray-600 text-xl text-center">
            No playlists found
          </h2>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(lists) ? lists : []).map((p) => (
            <div key={p._id} className="relative border rounded p-3 group">
              {/* Delete Playlist */}
              <button
                onClick={() => deletePlaylist(p._id)}
                className="absolute top-2 right-2 bg-white border rounded-full px-2 py-1 text-sm opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition"
              >
                🗑️
                <span className="absolute top-full right-0 mt-1 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow">
                  Delete Playlist
                </span>
              </button>

              {/* Playlist Header */}
              <button
                className="w-full text-left pr-8"
                onClick={() => setOpenId((cur) => (cur === p._id ? "" : p._id))}
              >
                <div className="font-medium flex items-center justify-between">
                  <span>{p.name || p.title || "Untitled"}</span>
                  <span className="text-sm text-gray-500 mr-1">
                    {p?.videos?.length || 0} videos
                  </span>
                </div>
              </button>

              {/* Playlist Videos */}
              {openId === p._id && (
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {(p?.videos || []).length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No videos in this playlist
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(p.videos || []).map((v) => (
                        <div
                          key={v._id || v.id}
                          className="relative group/video"
                        >
                          <VideoCard video={v} />
                          {/* Delete Video */}
                          <button
                            onClick={async () => {
                              try {
                                await api.request(
                                  endpoints.removeFromPlaylist(v._id, p._id),
                                  { method: "PATCH" }
                                );
                                setLists((prevLists) => {
                                  const updated = [...prevLists];
                                  const idx = updated.findIndex(
                                    (pl) => pl._id === p._id
                                  );
                                  if (idx === -1) return prevLists;
                                  const oldPlaylist = updated[idx];
                                  const newVideos = oldPlaylist.videos.filter(
                                    (vid) => vid._id !== v._id
                                  );
                                  updated[idx] = {
                                    ...oldPlaylist,
                                    videos: newVideos,
                                  };
                                  return updated;
                                });
                              } catch (error) {
                                console.error("Failed to remove video:", error);
                              }
                            }}
                            className="absolute top-2 right-2 bg-white border rounded-full px-2 py-1 text-sm opacity-0 group-hover/video:opacity-100 hover:bg-red-100 hover:text-red-600 transition"
                          >
                            🗑️
                            <span className="absolute top-full right-0 mt-1 hidden group-hover/video:block text-xs bg-gray-800 text-white px-2 py-1 rounded shadow">
                              Delete
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
