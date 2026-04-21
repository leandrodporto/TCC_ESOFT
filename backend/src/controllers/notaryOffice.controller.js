import prisma from "../lib/prisma.js";
import { getAddressId } from "../services/address.services.js";

export async function createNotaryOffice(req, res) {
  try {
    const { zone, name, phone, streetNumber, complement } = req.body;
    const notaryOffice = await prisma.notaryOffice.create({
      data: {
        zone,
        name,
        phone,
        streetNumber,
        complement,
        Address: { connect: { id: await getAddressId(req.body.address) } },
      },
    });
    res.status(201).json(notaryOffice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getNotaryOffices(req, res) {
  try {
    const notaryOffices = await prisma.notaryOffice.findMany({
      include: {
        Address: true,
      },
    });
    res.status(200).json(notaryOffices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getNotaryOfficeById(req, res) {
  try {
    const { id } = req.params;
    const notaryOffice = await prisma.notaryOffice.findUnique({
      where: { id: id },
      include: {
        Address: true,
      },
    });
    if (!notaryOffice) {
      return res.status(404).json({ error: "Notary office not found" });
    }
    res.status(200).json(notaryOffice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateNotaryOffice(req, res) {
  try {
    const { id } = req.params;
    const { zone, name, phone } = req.body;
    const notaryOffice = await prisma.notaryOffice.update({
      where: { id:  id },
      data: {
        zone,
        name,
        phone,
        ...(req.body.address && {
          Address: { connect: { id: await getAddressId(req.body.address) } },
        }),
      },
    });
    res.status(200).json(notaryOffice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteNotaryOffice(req, res) {
  try {
    const { id } = req.params;
    await prisma.notaryOffice.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
