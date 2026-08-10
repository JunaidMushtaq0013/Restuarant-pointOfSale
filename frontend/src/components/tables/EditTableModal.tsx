import { useEffect, useState } from "react";

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved";
  isActive: boolean;
}

interface EditTableModalProps {
  isOpen: boolean;
  table: Table | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    tableNumber: number,
    capacity: number,
  ) => Promise<void>;
  submitting: boolean;
}

const EditTableModal = ({
  isOpen,
  table,
  onClose,
  onSubmit,
  submitting,
}: EditTableModalProps) => {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    if (table) {
      setTableNumber(String(table.tableNumber));
      setCapacity(String(table.capacity));
    }
  }, [table]);

  if (!isOpen || !table) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableNumber || !capacity) {
      return;
    }

    await onSubmit(
      table._id,
      Number(tableNumber),
      Number(capacity),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Table
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update the table details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="edit-table-number"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Table Number
            </label>

            <input
              id="edit-table-number"
              type="number"
              min="1"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-capacity"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Capacity
            </label>

            <input
              id="edit-capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTableModal;