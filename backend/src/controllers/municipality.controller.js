import prisma from "../lib/prisma.js";

export async function createMunicipality(req, res) {
  try {
    const { name, code, notaryOfficeId } = req.body;
    const municipality = await prisma.municipality.create({
      data: {
        name,
        code,
        NotaryOffice: {
          connect: {
            id: notaryOfficeId,
          },
        },
      },
    });
    res.status(201).json(municipality);
  } catch (error) {
    res.status(500).json({ error: "Failed to create municipality" });
  }
}

export async function getAllMunicipalities(req, res) {
  try {
    const municipalities = await prisma.municipality.findMany();
    res.status(200).json(municipalities);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve municipalities" });
  }
}

export async function getMunicipalityById(req, res) {
  try {
    const { id } = req.params;
    const municipality = await prisma.municipality.findUnique({
      where: { id: id },
    }); 
    if (!municipality) {
      return res.status(404).json({ error: "Municipality not found" });
    }
    res.status(200).json(municipality);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve municipality" });
  }
}

export async function updateMunicipality(req, res) {
  try {
    const { id } = req.params;
    const { name, code, notaryOfficeId } = req.body;
    const municipality = await prisma.municipality.update({
      where: { id: id },
      data: {
        name,
        code,
        NotaryOffice: {
          connect: {
            id: notaryOfficeId,
          },
        },
      },
    });
    res.status(200).json(municipality);
  } catch (error) {
    res.status(500).json({ error: "Failed to update municipality" });
  }
}

export async function deleteMunicipality(req, res) {
  try {
    const { id } = req.params;
    await prisma.municipality.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete municipality" });
  }
}
