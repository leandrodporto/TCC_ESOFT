import prisma from "../lib/prisma.js";
import { getAddressId } from "../services/address.services.js";

export async function createVotingPlace(req, res) {
  try {
    const {
      code,
      name,
      municipalityId,
      streetNumber,
      complement,
      sections,
      voters,
      notaryOfficeId,
      isTransmissionPoint,
      transmissionOperator,
      transmissionPointKit,
      transmissionPointKitPassword,
      transmitToVotingPlaceId,
      transmitToNotaryOfficeId,
    } = req.body;

    console.log(req.body);

    const votingPlace = await prisma.votingPlace.create({
      data: {
        code,
        name,
        streetNumber,
        complement,
        sections,
        voters,

        isTransmissionPoint,
        transmissionOperator,
        transmissionPointKit,
        transmissionPointKitPassword,

        Address: {
          connect: { id: await getAddressId(req.body.address) },
        },
        Municipality: {
          connect: {
            id: municipalityId,
          },
        },
        NotaryOffice: {
          connect: {
            id: notaryOfficeId,
          },
        },
        ...(isTransmissionPoint == false && {
          ...(transmitToVotingPlaceId != null && {
            transmitToVotingPlace: {
              connect: { id: transmitToVotingPlaceId },
            },
          }),
          ...(transmitToVotingPlaceId == null && {
            transmitToNotaryOffice: {
              connect: { id: transmitToNotaryOfficeId },
            },
          }),
        }),
      },
    });
    res.status(201).json(votingPlace);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}

export async function getAllVotingPlaces(req, res) {
  try {
    const votingPlaces = await prisma.votingPlace.findMany();
    res.status(200).json(votingPlaces);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve voting places" });
  }
}

export async function getVotingPlaceById(req, res) {
  try {
    const { id } = req.params;
    const votingPlace = await prisma.votingPlace.findUnique({
      where: { id: parseInt(id) },
    });
    if (!votingPlace) {
      return res.status(404).json({ error: "Voting place not found" });
    }
    res.status(200).json(votingPlace);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve voting place" });
  }
}

export async function updateVotingPlace(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      streetNumber,
      complement,
      sections,
      voters,
      notaryOfficeId,
      municipalityId,
    } = req.body;
    const votingPlace = await prisma.votingPlace.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        streetNumber,
        complement,
        sections,
        voters,
        NotaryOffice: {
          connect: {
            id: notaryOfficeId,
          },
        },
        Address: {
          connect: { id: await getAddressId(req.body.address) },
        },
        municipality: {
          connect: {
            id: municipalityId,
          },
        },
      },
    });
    res.status(200).json(votingPlace);
  } catch (error) {
    res.status(500).json({ error: "Failed to update voting place" });
  }
}

export async function deleteVotingPlace(req, res) {
  try {
    const { id } = req.params;
    await prisma.votingPlace.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete voting place" });
  }
}
