import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";
const router = Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login", loginUser);
router.post("/refresh-token", getRefreshAccessToken);

//secured routes
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeCurrentPassword);

// get current logged-in user
router.get("/current-user", verifyJWT, getCurrentUser);

// update user account details (name/email)
router.patch("/update-account", verifyJWT, updateAccountDetails);

// update avatar
router.patch(
  "/update-avatar",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

// update cover image
router.patch(
  "/update-cover",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);

router.get("/channel/:username", verifyJWT, getUserChannelProfile);
router.get("/history", verifyJWT, getWatchHistory);

export default router;
