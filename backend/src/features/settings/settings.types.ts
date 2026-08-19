export interface SettingsType {
  restaurantName: string;

  logoUrl?: string;

  initials?: string;

  restaurantAddress: string;

  phone: string;

  email: string;

  currency: string;

  gstNumber: string;

  gstPercentage: number;

  serviceChargePercentage: number;

  openingTime: string;

  closingTime: string;

  invoiceFooter: string;
}
