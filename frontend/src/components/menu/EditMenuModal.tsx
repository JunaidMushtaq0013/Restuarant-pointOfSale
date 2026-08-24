import { useEffect, useState } from "react";
import api from "../../api/axious";

interface Category {
  _id: string;
  name: string;
  isActive: boolean;
}

interface InventoryItem {
  _id: string;
  name: string;
  itemType: "Raw Material" | "Ready Item";
  unit: "kg" | "g" | "l" | "ml" | "pcs";
  quantity: number;
  minimumStock: number;
  buyingPrice: number;
  isActive: boolean;
}

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  inventory: InventoryItem;
  category: Category;
  sellingPrice: number;
  type: "Veg" | "Non-Veg";
  isActive: boolean;
}

interface EditMenuModalProps {
  isOpen: boolean;
  menuItem: MenuItem | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    name: string,
    description: string,
    category: string,
    inventory: string,
    sellingPrice: number,
    type: "Veg" | "Non-Veg",
    image: File | null,
  ) => void;
  submitting: boolean;
}

const EditMenuModal = ({
  isOpen,
  menuItem,
  onClose,
  onSubmit,
  submitting,
}: EditMenuModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [inventory, setInventory] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [type, setType] = useState<"Veg" | "Non-Veg">("Veg");
  const [image, setImage] = useState<File | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!isOpen || !menuItem) {
      return;
    }

    setName(menuItem.name);
    setDescription(menuItem.description || "");
    setCategory(menuItem.category?._id || "");
    setInventory(menuItem.inventory?._id || "");
    setSellingPrice(String(menuItem.sellingPrice));
    setType(menuItem.type);
    setImage(null);

    const getFormData = async () => {
      try {
        setLoadingData(true);

        const [categoryResponse, inventoryResponse] = await Promise.all([
          api.get("/categories"),
          api.get("/inventory"),
        ]);

        setCategories(categoryResponse.data.data);

        const readyItems = inventoryResponse.data.data.filter(
          (item: InventoryItem) =>
            item.itemType === "Ready Item" && item.isActive,
        );

        setInventoryItems(readyItems);
      } catch (error) {
        console.error("Failed to load menu form data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    getFormData();
  }, [isOpen, menuItem]);

  if (!isOpen || !menuItem) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (!category) {
      return;
    }

    if (!inventory) {
      return;
    }

    if (!sellingPrice) {
      return;
    }

    onSubmit(
      menuItem._id,
      name.trim(),
      description.trim(),
      category,
      inventory,
      Number(sellingPrice),
      type,
      image,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Menu Item
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update the menu item details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Burger"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Menu Image
            </label>

            {menuItem.image && !image && (
              <div className="mb-3 overflow-hidden rounded-lg">
                <img
                  src={menuItem.image}
                  alt={menuItem.name}
                  className="h-32 w-full object-cover"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files?.[0] || null);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              Leave empty to keep the existing image.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loadingData}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">
                {loadingData ? "Loading categories..." : "Select category"}
              </option>

              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Inventory */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Inventory Item
            </label>

            <select
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              disabled={loadingData}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">
                {loadingData ? "Loading inventory..." : "Select ready item"}
              </option>

              {inventoryItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              Only active Ready Items can be added to the menu.
            </p>
          </div>

          {/* Selling Price */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Selling Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Type
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType("Veg")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium ${
                  type === "Veg"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Veg
              </button>

              <button
                type="button"
                onClick={() => setType("Non-Veg")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium ${
                  type === "Non-Veg"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Non-Veg
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingData}
              className="btn-primary"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuModal;
