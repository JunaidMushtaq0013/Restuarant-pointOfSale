import { Settings } from "./settings.model.js";
import { SettingsType } from "./settings.types.js";

export const getSettingsService = async () => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      restaurantName: "Demo Restaurant",
      logoUrl: "",
      initials: "DR",
      restaurantAddress: "Demo street",
      phone: "0000000000",
      email: "restaurant@example.com",
      currency: "₹",
      gstNumber: "",
      gstPercentage: 0,
      serviceChargePercentage: 0,
      openingTime: "09:00",
      closingTime: "22:00",
      invoiceFooter: "Thank you for visiting!",
    });
  }

  return settings;
};



export const getPublicSettingsService = async () => {
  const settings = await Settings.findOne().select(
    "restaurantName logoUrl initials restaurantAddress phone currency",
  );

  if (!settings) {
    throw new Error("Restaurant settings not found.");
  }

  return settings;
};

export const updateSettingsService = async (payload: SettingsType) => {
  return await Settings.findOneAndUpdate({}, payload, {
    new: true,
    runValidators: true,
  });
};


