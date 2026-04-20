import { Router } from "express";
import { createVotingPlace, getAllVotingPlaces, getVotingPlaceById, updateVotingPlace, deleteVotingPlace } from "../controllers/votingPlace.controller.js";

const votingPlaceRouter = Router();

votingPlaceRouter.post("/", createVotingPlace);
votingPlaceRouter.get("/", getAllVotingPlaces);
votingPlaceRouter.get("/:id", getVotingPlaceById);
votingPlaceRouter.put("/:id", updateVotingPlace);
votingPlaceRouter.delete("/:id", deleteVotingPlace);

export default votingPlaceRouter;