import { Router } from "express";
import userRouter from "./user.routes.js";
import authRouter from "./auth.routes.js";
import notaryOfficeRouter from "./notaryOffice.routes.js";
import municipalityRouter from "./municipality.routes.js";
import votingPlaceRouter from "./votingPlace.routes.js";  

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/notary-offices", notaryOfficeRouter);
router.use("/municipalities", municipalityRouter);
router.use("/voting-places", votingPlaceRouter);

export default router;