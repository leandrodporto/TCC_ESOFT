import prisma from "../lib/prisma.js";

const createAddress = async (address) => {
  try {

    const { city, street, state, zipCode, neighborhood, country } = address;

    const addressData = await prisma.address.create({
      data: {
        city,
        street,
        state,
        zipCode,
        neighborhood,
        country,

      },
    });
    return addressData;
  } catch (error) {
    throw new Error("createAddress - catch", error);
  }
};

const getAllAddresses = async () => {
  try {
    const addresses = await prisma.address.findMany();
    return addresses;
  } catch (error) {
    throw new Error("getAllAddresses - catch", error);
  }
};

const getAddressById = async (id) => {
  try {
    const address = await prisma.address.findUnique({
      where: { id },
    });
    if (!address) {
      throw new Error("Address not found");
    }
    return address;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateAddress = async (id, data) => {
  try {
    const { city, street, state, zipCode, neighborhood, country, complement } =
      await sanitizer([
        data.city,
        data.street,
        data.state,
        data.zipCode,
        data.neighborhood,
        data.country,
        data.complement,
      ]);

    const address = await prisma.address.update({
      where: { id },
      data: {
        city,
        street,
        state,
        zipCode,
        neighborhood,
        country,
        complement,
      },
    });
    return address;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteAddress = async (id) => {
  try {
    await prisma.address.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAddressByZipCode = async (zipCode) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { zipCode },
    });

    if (!addresses || addresses.length === 0) {
      return null;
    }
    return addresses;
  } catch (error) {
    return new Error("getAddressByZipCode - catch",error);
  }
};

export const getAddressId = async (addressData) => {
  try {   
    let addressId = await getAddressByZipCode(addressData.zipCode);
    if (!addressId || addressId.length === 0) {
      addressId = await createAddress(addressData);
      return addressId.id;
    }
    return addressId[0].id;
  } catch (error) {
    throw new Error("getAddressId - catch",error);
  }
}
