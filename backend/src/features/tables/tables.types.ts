export type TableStatus = "Available" | "Occupied" | "Reserved";

export interface TableType {
  tableNumber: number;
  capacity: number;
  status?: TableStatus;
  isActive?: boolean;
  qrToken: string;
}