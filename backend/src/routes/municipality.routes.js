import { Router } from "express";
import { createMunicipality, deleteMunicipality, getAllMunicipalities, getMunicipalityById, updateMunicipality } from "../controllers/municipality.controller.js";

const municipalityRouter = Router();

municipalityRouter.post("/", createMunicipality);
municipalityRouter.get("/", getAllMunicipalities);
municipalityRouter.get("/:id", getMunicipalityById);
municipalityRouter.put("/:id", updateMunicipality);
municipalityRouter.delete("/:id", deleteMunicipality);

export default municipalityRouter;
