import { Request, Response } from "express";
import {
  createTableService,
  getTablesService,
  getInacticeTablesService,
  getTableByIdService,
  updateTableService,
  deleteTableService,
  updateTableStatusService,
  activateTableService,
  getTableQrService,
  getTableByQrTokenService,
} from "./tables.service.js";

export const createTableController = async (
  req: Request,
  res: Response
) => {
  const table = await createTableService(req.body);

  res.status(201).json({
    status: "success",
    message: "Table created successfully.",
    data: table,
  });
};


export const getTablesController = async (
  req: Request,
  res: Response
) => {
  const tables = await getTablesService();

  res.status(200).json({
    status: "success",
    message: "Tables retrieved successfully.",
    data: tables,
  });
};

export const getTableByQrTokenController = async (
  req: Request<{ qrToken: string }>,
  res: Response,
) => {
  const table = await getTableByQrTokenService(req.params.qrToken);

  res.status(200).json({
    status: "success",
    message: "Table identified successfully.",
    data: table,
  });
};

export const getInactiveTablesController = async (
  req: Request,
  res: Response
) => {
  const tables = await getInacticeTablesService();

  res.status(200).json({
    status: "success",
    message: "In active Tables retrieved successfully.",
    data: tables,
  });
};



export const getTableByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const table = await getTableByIdService(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Table retrieved successfully.",
    data: table,
  });
};

export const activateTableController = async (
  req: Request<{id:string}>,
  res: Response,
) => {
  const { id } = req.params;

  const table = await activateTableService(id);

  res.status(200).json({
    status: "success",
    message: "Table activated successfully.",
    data: table,
  });
};

export const updateTableController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const table = await updateTableService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: "success",
    message: "Table updated successfully.",
    data: table,
  });
};


export const deleteTableController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const table = await deleteTableService(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Table deactivated successfully.",
    data: table,
  });
};


export const updateTableStatusController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const table = await updateTableStatusService(
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    status: "success",
    message: "Table status updated successfully.",
    data: table,
  });
};

export const getTableQrController = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const qrData = await getTableQrService(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Table QR data generated successfully.",
    data: qrData,
  });
};