import prisma from "../lib/prisma.js";
import calculateRouterService from "../services/calculateRouter.services.js";

export const getRouters = async (req, res) => {
  try {
    const routers = await prisma.routers.findMany();
    res.json(routers);
  } catch (error) {
    console.error("Error fetching routers: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching routers." });
  }
};

export const getRouterById = async (req, res) => {
  const { id } = req.params;
  try {
    const router = await prisma.routers.findUnique({ where: { id: id } });
    if (router) {
      res.json(router);
    } else {
      res.status(404).json({ error: "Router not found." });
    }
  } catch (error) {
    console.error("Error fetching router: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the router." });
  }
};

export const calculateRouter = async (req, res) => {
  try {

    await prisma.routers.deleteMany(); // Limpa as rotas anteriores antes de calcular novas

    const response = await calculateRouterService();
    if (!response) {
      return res.status(404).json({ error: "Calculation failed." });
    }

    response.forEach(async (route) => {
      await prisma.routers.create({
        data: {
          routerData: route,
        },
      });
    });

    res.status(201).json({ msg: "Router calculated successfully." });
  } catch (error) {
    console.error("Error creating router: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the router." });
  }
};

export const updateRouter = async (req, res) => {
  const { id } = req.params;
  const { origin, destination, distance } = req.body;
  try {
    const updatedRouter = await prisma.routers.update({
      where: { id: id },
      data: { origin, destination, distance },
    });
    res.json(updatedRouter);
  } catch (error) {
    console.error("Error updating router: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the router." });
  }
};

export const deleteRouter = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.routers.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting router: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the router." });
  }
};
