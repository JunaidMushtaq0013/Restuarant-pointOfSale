import { useEffect, useState } from "react";
import api from "../../api/axious";
import AddTableModal from "../../components/tables/AddTableModal";
import EditTableModal from "../../components/tables/EditTableModal";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/common/ConfirmModal";
import ActionIcon from "../../components/common/ActionIcon";
import { toast } from "react-toastify";

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved";
  isActive: boolean;
}
const Tables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [inactiveTables, setInactiveTables] = useState<Table[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [tableToDeactivate, setTableToDeactivate] = useState<Table | null>(
    null,
  );
  const [tableToRelease, setTableToRelease] = useState<Table | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const getTables = async () => {
      try {
        const response = await api.get("/tables");

        setTables(response.data.data);
      } catch (error) {
        console.error("Failed to load tables:", error);
      } finally {
        setLoading(false);
      }
    };

    getTables();
  }, []);

  const getInactiveTables = async () => {
    try {
      const response = await api.get("/tables/inactive");

      setInactiveTables(response.data.data);
      setShowInactive(true);
    } catch (error) {
      console.error("Failed to load inactive tables:", error);
    }
  };

  const activateTable = async (id: string) => {
    try {
      setSubmitting(true);

      const response = await api.patch(`/tables/${id}/activate`);

      const activatedTable = response.data.data;

      // Add the table back to active tables
      setTables((prevTables) =>
        [...prevTables, activatedTable].sort(
          (a, b) => a.tableNumber - b.tableNumber,
        ),
      );

      // Remove it from inactive tables
      setInactiveTables((prevTables) =>
        prevTables.filter((table) => table._id !== id),
      );
    } catch (error) {
      console.error("Failed to activate table:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const createTable = async (tableNumber: number, capacity: number) => {
    try {
      setSubmitting(true);

      const response = await api.post("/tables", {
        tableNumber,
        capacity,
      });

      setTables((prevTables) =>
        [...prevTables, response.data.data].sort(
          (a, b) => a.tableNumber - b.tableNumber,
        ),
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create table:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const deactivateTable = async (id: string) => {
    try {
      setSubmitting(true);

      await api.delete(`/tables/${id}`);

      // Remove from active tables
      setTables((prevTables) => prevTables.filter((table) => table._id !== id));
    } catch (error) {
      console.error("Failed to deactivate table:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const releaseTable = async (id: string) => {
    try {
      setSubmitting(true);
      const response = await api.patch(`/tables/${id}/status`, {
        status: "Available",
      });

      setTables((previousTables) =>
        previousTables.map((table) =>
          table._id === id ? response.data.data : table,
        ),
      );
      toast.success("Table released and is now available.");
    } catch (error) {
      console.error("Failed to release table:", error);
      toast.error("Failed to release table.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateTable = async (
    id: string,
    tableNumber: number,
    capacity: number,
  ) => {
    try {
      setSubmitting(true);

      const response = await api.patch(`/tables/${id}`, {
        tableNumber,
        capacity,
      });

      setTables((prevTables) =>
        prevTables
          .map((table) => (table._id === id ? response.data.data : table))
          .sort((a, b) => a.tableNumber - b.tableNumber),
      );

      setSelectedTable(null);
    } catch (error) {
      console.error("Failed to update table:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading tables...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tables</h1>

          <p className="mt-1 text-sm text-gray-500">Manage restaurant tables</p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user?.role === "Manager" && (
            <button
              onClick={getInactiveTables}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Inactive Tables
            </button>
          )}

          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            + Add Table
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables.map((table) => {
          const isAvailable = table.status === "Available";

          return (
            <div
              key={table._id}
              className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Table Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Table
                  </p>

                  <h2 className="mt-1 text-3xl font-bold text-gray-900">
                    {table.tableNumber}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Capacity: {table.capacity} people
                  </p>
                </div>

                {/* Status Indicator */}
                <span
                  className={`h-3 w-3 rounded-full ${
                    isAvailable ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>

              {/* Status */}
              <div className="mt-5">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                    isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {table.status}
                </span>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setSelectedTable(table)}
                className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                aria-label={`Edit table ${table.tableNumber}`}
              >
                <ActionIcon label="Edit" />
              </button>

              {(user?.role === "Manager" || user?.role === "Cashier") &&
                table.status === "Occupied" && (
                  <button
                    onClick={() => setTableToRelease(table)}
                    disabled={submitting}
                    className="mt-2 w-full rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:opacity-50"
                    aria-label={`Release table ${table.tableNumber}`}
                  >
                    <ActionIcon label="Release" />
                  </button>
                )}

              {user?.role === "Manager" && (
                <button
                  onClick={() => setTableToDeactivate(table)}
                  disabled={submitting}
                  className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  aria-label={`Deactivate table ${table.tableNumber}`}
                >
                  <ActionIcon label="Deactivate" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {showInactive && (
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Inactive Tables
              </h2>

              <p className="text-sm text-gray-500">
                Tables that have been deactivated.
              </p>
            </div>

            <button
              onClick={() => setShowInactive(false)}
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Hide
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {inactiveTables.map((table) => (
              <div
                key={table._id}
                className="rounded-2xl bg-gray-100 p-5 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Table
                </p>

                <h2 className="mt-1 text-3xl font-bold text-gray-700">
                  {table.tableNumber}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Capacity: {table.capacity} people
                </p>

                <span className="mt-4 inline-flex rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
                  Inactive
                </span>

                <button
                  onClick={() => activateTable(table._id)}
                  className="mt-4 w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  aria-label={`Activate table ${table.tableNumber}`}
                >
                  <ActionIcon label="Activate" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddTableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createTable}
        submitting={submitting}
      />

      <EditTableModal
        isOpen={selectedTable !== null}
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        onSubmit={updateTable}
        submitting={submitting}
      />

      <ConfirmModal
        isOpen={tableToDeactivate !== null}
        title="Deactivate Table"
        message={
          tableToDeactivate
            ? `Are you sure you want to deactivate Table ${tableToDeactivate.tableNumber}?`
            : ""
        }
        confirmText="Deactivate"
        cancelText="Cancel"
        loading={submitting}
        onCancel={() => setTableToDeactivate(null)}
        onConfirm={async () => {
          if (!tableToDeactivate) {
            return;
          }

          await deactivateTable(tableToDeactivate._id);
          setTableToDeactivate(null);
        }}
      />

      <ConfirmModal
        isOpen={tableToRelease !== null}
        title="Release Table"
        message={
          tableToRelease
            ? `Release Table ${tableToRelease.tableNumber}? Only do this after confirming the guests have left or the order was handled separately.`
            : ""
        }
        confirmText="Release"
        cancelText="Cancel"
        loading={submitting}
        onCancel={() => setTableToRelease(null)}
        onConfirm={async () => {
          if (!tableToRelease) return;
          await releaseTable(tableToRelease._id);
          setTableToRelease(null);
        }}
      />
    </div>
  );
};

export default Tables;
