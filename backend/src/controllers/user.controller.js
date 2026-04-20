import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import {
  validateUserData,
  validateUserId,
} from "../services/validations.services.js";
import { getAddressId } from "../services/address.services.js";

export async function createUser(req, res) {
  try {
    const [name, email, phone, userType, streetNumber, complement, notaryOfficeId] = [
      req.body.name,
      req.body.email,
      req.body.phone,
      req.body.userType,
      req.body.streetNumber,
      req.body.complement,
      req.body.notaryOfficeId,
    ];

    if (userType !== "ROOT" && !notaryOfficeId) {
      throw new Error("Cartório é obrigatório para este tipo de usuário");
    }

    await validateUserData({ name, email, phone, userType }).catch((error) => {
      throw new Error(error.message);
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        userType,
        streetNumber,
        complement,
        Address: {
          connect: { id: await getAddressId(req.body.address) },
        },
        Auth: {
          create: {
            password: await bcrypt.hash(req.body.auth.password, 12),
          },
        },
        ...(userType !== "ROOT" && {
          NotaryOffice: {
            connect: { id: notaryOfficeId },
          },
        }),
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error });
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    await validateUserId(id).catch((error) => {
      throw new Error("getUserById - catch", error);
    });
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    await validateUserId(id).catch((error) => {
      throw new Error(error.message);
    });
    const [name, email, phone, userType, streetNumber, complement, notaryOfficeId] = [
      req.body.name,
      req.body.email,
      req.body.phone,
      req.body.userType,
      req.body.streetNumber,
      req.body.complement,
      req.body.notaryOfficeId,
    ];

    if (userType !== "ROOT" && !notaryOfficeId) {
      throw new Error("Cartório é obrigatório para este tipo de usuário");
    }

    await validateUserData({ name, email, phone, userType }).catch((error) => {
      throw new Error(error.message);
    });

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        phone,
        userType,
        streetNumber,
        complement,
        ...(req.body.address && {
          Address: {
            connect: { id: await getAddressId(req.body.address) },
          },
        }),
        ...(userType !== "ROOT" && {
          NotaryOffice: {
            connect: { id: notaryOfficeId },
          },
        }),
      },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await validateUserId(id).catch((error) => {
      throw new Error(error.message);
    });
    const user = await prisma.user.delete({
      where: {
        id,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
