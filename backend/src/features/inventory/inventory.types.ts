export interface InventoryType {
  name: string;
  unit: "kg" | "g" | "l" | "ml" | "pcs";

  quantity: number;

  minimumStock: number;

  buyingPrice: number;


  isActive: boolean;
}