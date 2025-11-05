import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const getAccessRefreshTokens = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;
  // console.log("How body looks in backend: ", req.body);

  if (
    //input validation
    [fullName, email, userName, password].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All fields are required !!");
  }

  const existUser = await User.findOne({
    $or: [{ userName }, { email }],
  }); //check if an entry is present with same email or username
  if (existUser) {
    throw new ApiError(409, "The username or email already exists !!");
  }
  // console.log("FILES req.files: ", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // console.log(" AVATAR file path", avatarLocalPath);

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is required !!");
  }

  //uploading cover image and avatar image on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log("Response from cloudinary AVATAR", avatar);
  const coverImage = null;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }
  if (!avatar) {
    throw new ApiError(400, "Avatar File is required !!");
  }

  const user = await User.create({
    fullName,
    email,
    userName: userName.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  //verifying if user was created and then removing fields like password and refresh token
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the User !!"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered successfully "));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Usename or email is required ");
  }
  if (!password) {
    throw new ApiError(400, "Password is required ");
  }

  const user = await User.findOne({
    $or: [{ userName: username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exists !!");
  }

  const validPassword = await user.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(401, "Invalid user credentials !!");
  }

  const { accessToken, refreshToken } = await getAccessRefreshTokens(user._id);
  //query db and remove certain fields to send data in response
  // const loggedInUser = await User.findById(user._id).select(
  //   "-password -refreshToken"
  // );
  const safeUser = user.toObject();
  console.log("Safe user before deleting password", safeUser);

  delete safeUser.password;
  delete safeUser.refreshToken;
  console.log("Safe user ", safeUser);

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    .json(
      new ApiResponse(
        200,
        { user: safeUser, accessToken, refreshToken },
        "User loggedin Success"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  //we created auth.js middleware because we wanted which user we want to delete, we cant have a form based input
  // for taking user details for logout, thus using middleware ( takes cookie from request and adds user field in REQ)
  const user = req.user;
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

// to get new access token if old access token got expired
const getRefreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh Token Tampered/used or Expired");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken: newAt, refreshToken: newRt } =
      await getAccessRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", newAt, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 7 days
      })
      .cookie("refreshToken", newRt, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 30 days
      })
      .json(new ApiResponse(200, { newAt, newRt }, "Access Token Refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token yo");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { password, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPassCorrect = await user.isPasswordCorrect(password);
  if (!isPassCorrect) {
    throw new ApiError(400, "Invalid Old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully "));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const currUser = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, currUser, "User fetched Success"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocal = req.file?.path;
  if (!avatarLocal) {
    throw new ApiError(400, "Avatar file is missing");
  }
  // TODO : Delete old avatar image from cloudinary
  const avatar = await uploadOnCloudinary(avatarLocal);
  if (!avatar.url) {
    throw new ApiError(500, "Error while upload on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Success"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverLocal = req.file?.path;
  if (!coverLocal) {
    throw new ApiError(400, "Cover Image is missing");
  }
  const cover = await uploadOnCloudinary(coverLocal);
  if (!cover.url) {
    throw new ApiError(500, "Error while upload on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: cover.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated Success"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username || !username.trim()) {
    throw new ApiError(400, "Username is missing!!");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Successfully ")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  // Fetch user watch history ids
  const userDoc = await User.findById(req.user._id).select("watchHistory");
  const ids = Array.isArray(userDoc?.watchHistory) ? userDoc.watchHistory : [];
  if (ids.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Watch history fetched successfully"));
  }

  // Fetch all videos in one query
  const videos1 = await Video.find({ _id: { $in: ids } }).populate({
    path: "owner",
    select: "fullName userName avatar",
  });
  console.log("Videos fetched raw", videos1);

  const videos = await Video.find({ _id: { $in: ids } })
    .populate({
      path: "owner",
      select: "fullName userName avatar",
    })
    .lean();
  console.log("Videos fetched applied lean", videos);

  const byId = new Map(videos.map((v) => [String(v._id), v]));
  console.log("Created map, to map ids to complete video info", byId);

  // Order by most recent first (end of array is most recent)
  const ordered = [...ids]
    .reverse()
    .map((oid) => byId.get(String(oid)))
    .filter(Boolean);
  console.log("Final Ordered Watch History", ordered);

  return res
    .status(200)
    .json(new ApiResponse(200, ordered, "Watch history fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getRefreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
