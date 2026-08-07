import { Employee } from "./employee.model.js";
import { EmployeeType } from "./employee.types.js";

export const createEmployeeService = async (
  payload: EmployeeType
) => {
  const email = payload.email.toLowerCase();

  const emailExists = await Employee.findOne({
    email,
  });

  if (emailExists) {
    throw new Error("Email already exists.");
  }

  const phoneExists = await Employee.findOne({
    phone: payload.phone,
  });

  if (phoneExists) {
    throw new Error("Phone number already exists.");
  }

  const employee = await Employee.create({
    ...payload,
    email,
  });


return await Employee.findById(employee._id);
};

export const getEmployeesService = async () => {
  return await Employee.find().sort({
    createdAt: -1,
  });
};

export const getEmployeeByIdService = async (
  id: string
) => {
  const employee = await Employee.findById(id);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  return employee;
};

export const updateEmployeeService = async (
  id: string,
  payload: Partial<EmployeeType>
) => {
  const employee = await Employee.findById(id);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  if (
    payload.email &&
    payload.email.toLowerCase() !== employee.email
  ) {
    const emailExists = await Employee.findOne({
      email: payload.email.toLowerCase(),
      _id: { $ne: id },
    });

    if (emailExists) {
      throw new Error("Email already exists.");
    }

    payload.email = payload.email.toLowerCase();
  }

  if (
    payload.phone &&
    payload.phone !== employee.phone
  ) {
    const phoneExists = await Employee.findOne({
      phone: payload.phone,
      _id: { $ne: id },
    });

    if (phoneExists) {
      throw new Error("Phone number already exists.");
    }
  }

  return await Employee.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const updateEmployeeStatusService = async (
  id: string
) => {
  const employee = await Employee.findById(id);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  employee.isActive = false;

  await employee.save();

  return employee;
};