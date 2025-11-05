import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description)
    throw new ApiError(400, "Name and description required");

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    videos: [],
  });
  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const uid = userId && isValidObjectId(userId) ? userId : req.user._id;
  const playlists = await Playlist.find({ owner: uid }).populate({
    path: "videos",
    select: "title thumbnail duration owner views",
    populate: { path: "owner", select: "fullName userName avatar" },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const playlist = await Playlist.findById(playlistId).populate({
    path: "videos",
    select: "title thumbnail duration owner views",
    populate: { path: "owner", select: "fullName userName avatar" },
  });
  if (!playlist) throw new ApiError(404, "Playlist not found");
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(400, "Invalid id(s)");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (String(playlist.owner) !== String(req.user._id))
    throw new ApiError(403, "Not authorized");

  if (playlist.videos.includes(videoId))
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video already in playlist"));

  playlist.videos.push(videoId);
  await playlist.save();
  const populated = await Playlist.findById(playlistId).populate({
    path: "videos",
    select: "title thumbnail duration owner views",
    populate: { path: "owner", select: "fullName userName avatar" },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, populated, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(400, "Invalid id(s)");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (String(playlist.owner) !== String(req.user._id))
    throw new ApiError(403, "Not authorized");

  playlist.videos = playlist.videos.filter(
    (v) => String(v) !== String(videoId)
  );
  await playlist.save();
  const populated = await Playlist.findById(playlistId).populate({
    path: "videos",
    select: "title thumbnail duration owner views",
    populate: { path: "owner", select: "fullName userName avatar" },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, populated, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (String(playlist.owner) !== String(req.user._id))
    throw new ApiError(403, "Not authorized");

  await playlist.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist id");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (String(playlist.owner) !== String(req.user._id))
    throw new ApiError(403, "Not authorized");

  if (name) playlist.name = name;
  if (description) playlist.description = description;
  await playlist.save();

  const populated = await Playlist.findById(playlistId).populate({
    path: "videos",
    select: "title thumbnail duration owner views",
    populate: { path: "owner", select: "fullName userName avatar" },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, populated, "Playlist updated"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
