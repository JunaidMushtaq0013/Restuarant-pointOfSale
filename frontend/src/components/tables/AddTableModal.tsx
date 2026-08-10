import { useState } from "react";

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    tableNumber: number,
    capacity: number,
  ) => Promise<void>;
  submitting: boolean;
}

const AddTableModal = ({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: AddTableModalProps) => {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableNumber || !capacity) {
      return;
    }

    await onSubmit(
      Number(tableNumber),
      Number(capacity),
    );

    setTableNumber("");
    setCapacity("");
  };

  const handleClose = () => {
    setTableNumber("");
    setCapacity("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Table
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the table details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Table Number */}
          <div>
            <label
              htmlFor="tableNumber"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Table Number
            </label>

            <input
              id="tableNumber"
              type="number"
              min="1"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 3"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Capacity */}
          <div>
            <label
              htmlFor="capacity"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Capacity
            </label>

            <input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 4"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTableModal;