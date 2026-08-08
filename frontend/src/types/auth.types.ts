export interface LoginPayload {
  email: string;
  password: string;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "Manager" | "Cashier" | "Chef" | "Waiter";
  isActive: boolean;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    employee: Employee;
  };
}