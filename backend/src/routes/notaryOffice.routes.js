import { Router } from "express";
import { createNotaryOffice, getNotaryOfficeById, getNotaryOffices, updateNotaryOffice,deleteNotaryOffice } from "../controllers/notaryOffice.controller.js";
const notaryOfficeRouter = Router();

notaryOfficeRouter.post("/", createNotaryOffice); 
notaryOfficeRouter.get("/", getNotaryOffices);
notaryOfficeRouter.get("/:id", getNotaryOfficeById);
notaryOfficeRouter.patch("/:id", updateNotaryOffice);
notaryOfficeRouter.delete("/:id", deleteNotaryOffice);

export default notaryOfficeRouter;