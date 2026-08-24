import { useState } from "react";

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    itemType: "Raw Material" | "Ready Item",
    unit: "kg" | "g" | "l" | "ml" | "pcs",
    quantity: number,
    minimumStock: number,
    buyingPrice: number,
  ) => Promise<void>;
  submitting: boolean;
}

const AddInventoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: AddInventoryModalProps) => {
  const [name, setName] = useState("");
  const [itemType, setItemType] = useState<"Raw Material" | "Ready Item">(
    "Raw Material",
  );
  const [unit, setUnit] = useState<"kg" | "g" | "l" | "ml" | "pcs">("kg");
  const [quantity, setQuantity] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !quantity || !minimumStock || !buyingPrice) {
      return;
    }

    await onSubmit(
      name,
      itemType,
      unit,
      Number(quantity),
      Number(minimumStock),
      Number(buyingPrice),
    );

    setName("");
    setItemType("Raw Material");
    setUnit("kg");
    setQuantity("");
    setMinimumStock("");
    setBuyingPrice("");
  };

  const handleClose = () => {
    setName("");
    setItemType("Raw Material");
    setUnit("kg");
    setQuantity("");
    setMinimumStock("");
    setBuyingPrice("");

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Inventory</h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the inventory item details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Item Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rice"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Item Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Item Type
            </label>

            <select
              value={itemType}
              onChange={(e) =>
                setItemType(e.target.value as "Raw Material" | "Ready Item")
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            >
              <option value="Raw Material">Raw Material</option>
              <option value="Ready Item">Ready Item</option>
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Unit
            </label>

            <select
              value={unit}
              onChange={(e) =>
                setUnit(e.target.value as "kg" | "g" | "l" | "ml" | "pcs")
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="l">Liter (l)</option>
              <option value="ml">Milliliter (ml)</option>
              <option value="pcs">Pieces (pcs)</option>
            </select>
          </div>

          {/* Quantity + Minimum Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quantity
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="50"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum Stock
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
                placeholder="10"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                required
              />
            </div>
          </div>

          {/* Buying Price */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Buying Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={buyingPrice}
              onChange={(e) => setBuyingPrice(e.target.value)}
              placeholder="80"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Adding..." : "Add Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;
