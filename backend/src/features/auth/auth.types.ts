export interface LoginType {
  email: string;
  password: string;
}

export interface JwtUser {
  employeeId: string;
  role: "Manager" | "Cashier" | "Chef" | "Waiter";
  iat: number;
  exp: number;
}