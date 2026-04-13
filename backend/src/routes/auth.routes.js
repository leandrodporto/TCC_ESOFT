import { Router } from "express";
import { login, logout, tokenRefresh  } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/refresh", tokenRefresh);

export default authRouter;