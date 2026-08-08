import { Table } from "./tables.model.js";
import { TableType } from "./tables.types.js";

export const createTableService = async (payload: TableType) => {
  const tableExists = await Table.findOne({
    tableNumber: payload.tableNumber,
  });

  if (tableExists) {
    throw new Error("Table number already exists.");
  }

  return await Table.create(payload);
};

export const getTablesService = async () => {
  return await Table.find({
    isActive: true,
  }).sort({ tableNumber: 1 });
};

export const getTableByIdService = async (id: string) => {
  const table = await Table.findById(id);

  if (!table) {
    throw new Error("Table not found.");
  }

  return table;
};


export const updateTableService = async (
  id: string,
  payload: Partial<TableType>
) => {
  const table = await Table.findById(id);

  if (!table) {
    throw new Error("Table not found.");
  }

  if (
    payload.tableNumber &&
    payload.tableNumber !== table.tableNumber
  ) {
    const tableExists = await Table.findOne({
      tableNumber: payload.tableNumber,
      _id: { $ne: id },
    });

    if (tableExists) {
      throw new Error("Table number already exists.");
    }
  }

  return await Table.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteTableService = async (id: string) => {
  const table = await Table.findById(id);

  if (!table) {
    throw new Error("Table not found.");
  }

  if (table.status === "Occupied") {
    throw new Error("Occupied table cannot be deactivated.");
  }

  table.isActive = false;
  await table.save();

  return table;
};

export const updateTableStatusService = async (
  id: string,
  status: TableType["status"]
) => {
  const table = await Table.findOne({
    _id: id,
    isActive: true,
  });

  if (!table) {
    throw new Error("Table not found.");
  }

  table.status = status;

  await table.save();

  return table;
};