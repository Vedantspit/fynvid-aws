import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  getCommentLikeInfo,
  getVideoLikeInfo,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/info/v/:videoId").get(getVideoLikeInfo);

router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/info/c/:commentId").get(getCommentLikeInfo);

router.route("/videos").get(getLikedVideos);

export default router;
