import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const existing = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  if (existing) {
    await existing.deleteOne();
    const count = await Like.countDocuments({ video: videoId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, likesCount: count },
          "Unliked video"
        )
      );
  }

  await Like.create({ video: videoId, likedBy: req.user._id });
  const count = await Like.countDocuments({ video: videoId });
  return res
    .status(201)
    .json(
      new ApiResponse(201, { liked: true, likesCount: count }, "Liked video")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");

  const existing = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  if (existing) {
    await existing.deleteOne();
    const count = await Like.countDocuments({ comment: commentId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, likesCount: count },
          "Unliked comment"
        )
      );
  }

  await Like.create({ comment: commentId, likedBy: req.user._id });
  const count = await Like.countDocuments({ comment: commentId });
  return res
    .status(201)
    .json(
      new ApiResponse(201, { liked: true, likesCount: count }, "Liked comment")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likes = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  }).populate({
    path: "video",
    populate: { path: "owner", select: "fullName userName avatar" },
  });

  const videos = likes.map((l) => l.video).filter(Boolean);
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched"));
});

export { toggleCommentLike, toggleVideoLike, getLikedVideos };
/**
 * Return like info for a comment: { liked: boolean, likesCount: number }
 */

const getVideoLikeInfo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const [existing, count] = await Promise.all([
    Like.findOne({ video: videoId, likedBy: req.user._id }),
    Like.countDocuments({ video: videoId }),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: !!existing, likesCount: count },
        "Video like info"
      )
    );
});
const getCommentLikeInfo = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");

  const [existing, count] = await Promise.all([
    Like.findOne({ comment: commentId, likedBy: req.user._id }),
    Like.countDocuments({ comment: commentId }),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: !!existing, likesCount: count },
        "Comment like info"
      )
    );
});

export { getCommentLikeInfo, getVideoLikeInfo };
