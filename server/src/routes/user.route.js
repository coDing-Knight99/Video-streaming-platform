import { Router } from "express";
import { registerUser,loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route('/register').post(upload.fields([
    {
        name:"avatar",
        maxcount:1
    },
    {
        name:"coverImage",
        maxcount:1
    }
]),registerUser);

router.route('/login').post(upload.none(),loginUser);

router.route('/logout').post(verifyJWT,upload.none(),logoutUser);

router.route('/refreshaccessToken').post(upload.none(),refreshAccessToken);
export default router;