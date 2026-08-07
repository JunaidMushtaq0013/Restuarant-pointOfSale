export interface EmployeeType {
  name: string;

  email: string;

  phone: string;

  password: string;

  role: "Manager" | "Cashier" | "Chef" | "Waiter";

  isActive: boolean;
}