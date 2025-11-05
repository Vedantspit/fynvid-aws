import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const getChannelStats = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const [totalViewsAgg] = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
        totalVideos: { $sum: 1 },
      },
    },
  ]);

  const totalViews = totalViewsAgg ? totalViewsAgg.totalViews : 0;
  const totalVideos = totalViewsAgg ? totalViewsAgg.totalVideos : 0;
  const totalSubscribers = await Subscription.countDocuments({
    channel: ownerId,
  });

  // total likes on videos of this owner
  const ownerVideoIds = await Video.find({ owner: ownerId }).select("_id");
  console.log("Owner Video ID", ownerVideoIds);

  const videoIds = ownerVideoIds.map((v) => v._id);
  console.log("Video ID map ", videoIds);

  const totalLikes = videoIds.length
    ? await Like.countDocuments({ video: { $in: videoIds } })
    : 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalViews, totalVideos, totalSubscribers, totalLikes },
        "Channel stats fetched"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);

  const [total, videos] = await Promise.all([
    Video.countDocuments({ owner: ownerId }),
    Video.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.max(1, +limit)),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, page: +page, limit: +limit, total },
        "Channel videos fetched"
      )
    );
});

export { getChannelStats, getChannelVideos };
