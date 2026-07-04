import { addressRepository } from "../repository/address.repository.js";

class AddressService {
  async getAddresses(userId: string) {
    const addresses = await addressRepository.getAddresses(userId);
    return { success: true, data: addresses };
  }

  async createAddress(userId: string, data: any) {
    const { full_name, address_line_1, city, postal_code, country } = data;
    if (!full_name || !address_line_1 || !city || !postal_code || !country) {
      throw new Error("full_name, address_line_1, city, postal_code, and country are required");
    }
    const address = await addressRepository.createAddress(userId, data);
    return { success: true, data: address };
  }

  async deleteAddress(addressId: string, userId: string) {
    await addressRepository.deleteAddress(addressId, userId);
    return { success: true, message: "Address deleted" };
  }
}

export const addressService = new AddressService();
