import { Order } from "../orders/orders.model.js";
import { Customer } from "./customer.model.js";
import { CustomerType } from "./customer.types.js";

export const createCustomerService = async (payload: CustomerType) => {
  const customer = await Customer.create(payload);
  return customer;
};

export const getAllCustomersService = async () => {
  return await Customer.find().sort({ createdAt: -1 });
};

export const getAllActiveCustomersService = async (
  search?: string,
) => {
  const filter: any = {
    isActive: true,
  };

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  return await Customer.find(filter).sort({
    createdAt: -1,
  });
};

export const getCustomerByIdService = async (id: string) => {
  const customer = await Customer.findById(id);

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return customer;
};

export const getCustomerOrdersService = async (customerId: string) => {
  return await Order.find({
    customer: customerId,
  }).sort({ createdAt: -1 });
};

export const updateCustomerService = async (
  id: string,
  payload: Partial<CustomerType>
) => {
  const customer = await Customer.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return customer;
};

export const toggleCustomerActiveService = async (id: string) => {
  const customer = await Customer.findById(id);

  if (!customer) {
    throw new Error("Customer not found.");
  }

  customer.isActive = !customer.isActive;

  return await customer.save();
};

export const deleteCustomerService = async (id: string) => {
  const customer = await Customer.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return customer;
};