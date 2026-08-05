export interface InventoryType {
  name: string;

  itemType: "Raw Material" | "Ready Item";

  unit: string;

  quantity: number;

  minimumStock: number;

  buyingPrice: number;

  isActive: boolean;
}