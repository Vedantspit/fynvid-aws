import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Invalid channel id");
  if (String(channelId) === String(req.user._id))
    throw new ApiError(400, "Cannot subscribe to yourself");

  const channel = await User.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel not found");

  const existing = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });
  if (existing) {
    await existing.deleteOne();
    return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed"));
  }

  await Subscription.create({ subscriber: req.user._id, channel: channelId });
  return res.status(201).json(new ApiResponse(201, {}, "Subscribed"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Invalid channel id");

  const subs = await Subscription.find({ channel: channelId }).populate({
    path: "subscriber",
    select: "fullName userName avatar",
  });
  return res.status(200).json(
    new ApiResponse(
      200,
      subs.map((s) => s.subscriber),
      "Subscribers fetched"
    )
  );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId =
    req.params.subscriberId && isValidObjectId(req.params.subscriberId)
      ? req.params.subscriberId
      : req.user._id;
  const subs = await Subscription.find({ subscriber: subscriberId }).populate({
    path: "channel",
    select: "fullName userName avatar",
  });
  return res.status(200).json(
    new ApiResponse(
      200,
      subs.map((s) => s.channel),
      "Subscribed channels fetched"
    )
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
