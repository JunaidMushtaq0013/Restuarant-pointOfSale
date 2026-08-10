import { useEffect, useState } from "react";
import api from "../../api/axious";
import { useAuth } from "../../context/AuthContext";
import AddInventoryModal from "../../components/inventory/AddInventoryModal";
import EditInventoryModal from "../../components/inventory/EditInventoryModal";
import ConfirmModal from "../../components/common/ConfirmModal";

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

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedInventory, setSelectedInventory] =
    useState<InventoryItem | null>(null);

  const [inventoryToDeactivate, setInventoryToDeactivate] =
    useState<InventoryItem | null>(null);

  const [inactiveInventory, setInactiveInventory] = useState<InventoryItem[]>(
    [],
  );

  const [showInactive, setShowInactive] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const getInventory = async () => {
      try {
        const response = await api.get("/inventory");

        setInventory(response.data.data);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    getInventory();
  }, []);

  if (loading) {
    return <p>Loading inventory...</p>;
  }

  const createInventory = async (
    name: string,
    itemType: "Raw Material" | "Ready Item",
    unit: "kg" | "g" | "l" | "ml" | "pcs",
    quantity: number,
    minimumStock: number,
    buyingPrice: number,
  ) => {
    try {
      setSubmitting(true);

      const response = await api.post("/inventory", {
        name,
        itemType,
        unit,
        quantity,
        minimumStock,
        buyingPrice,
      });

      setInventory((prevInventory) => [response.data.data, ...prevInventory]);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create inventory item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateInventory = async (
    id: string,
    name: string,
    itemType: "Raw Material" | "Ready Item",
    unit: "kg" | "g" | "l" | "ml" | "pcs",
    quantity: number,
    minimumStock: number,
    buyingPrice: number,
  ) => {
    try {
      setSubmitting(true);

      const response = await api.patch(`/inventory/${id}`, {
        name,
        itemType,
        unit,
        quantity,
        minimumStock,
        buyingPrice,
      });

      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item._id === id ? response.data.data : item,
        ),
      );

      setSelectedInventory(null);
    } catch (error) {
      console.error("Failed to update inventory item:", error);
    } finally {
      setSubmitting(false);
    }
  };
  const deactivateInventory = async (id: string) => {
    try {
      setSubmitting(true);

      await api.delete(`/inventory/${id}`);

      setInventory((prevInventory) =>
        prevInventory.filter((item) => item._id !== id),
      );
    } catch (error) {
      console.error("Failed to deactivate inventory item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getInactiveInventory = async () => {
    try {
      const response = await api.get("/inventory/inactive");

      setInactiveInventory(response.data.data);
      setShowInactive(true);
    } catch (error) {
      console.error("Failed to load inactive inventory:", error);
    }
  };
  const activateInventory = async (id: string) => {
    try {
      setSubmitting(true);

      const response = await api.patch(`/inventory/${id}/activate`);

      setInactiveInventory((prevInventory) =>
        prevInventory.filter((item) => item._id !== id),
      );

      setInventory((prevInventory) => [response.data.data, ...prevInventory]);
    } catch (error) {
      console.error("Failed to activate inventory item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage restaurant inventory
          </p>
        </div>

        {user?.role === "Manager" && (
          <div className="flex items-center gap-3">
            <button
              onClick={getInactiveInventory}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Inactive Inventory
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              + Add Inventory
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Minimum Stock</th>
                <th className="px-6 py-4 font-medium">Buying Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {inventory.map((item) => {
                const isLowStock = item.quantity <= item.minimumStock;

                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">{item.itemType}</td>

                    <td className="px-6 py-4 text-gray-600">
                      {item.quantity} {item.unit}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {item.minimumStock} {item.unit}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      ₹{item.buyingPrice.toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          isLowStock
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {user?.role === "Manager" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInventory(item)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => setInventoryToDeactivate(item)}
                            disabled={submitting}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Deactivate
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showInactive && (
          <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Inactive Inventory
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Inventory items that are currently inactive
                </p>
              </div>

              <button
                onClick={() => setShowInactive(false)}
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Unit</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {inactiveInventory.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {item.itemType}
                      </td>

                      <td className="px-6 py-4 text-gray-600">{item.unit}</td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => activateInventory(item._id)}
                          disabled={submitting}
                          className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                        >
                          Activate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <AddInventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createInventory}
        submitting={submitting}
      />
      <EditInventoryModal
        isOpen={selectedInventory !== null}
        inventory={selectedInventory}
        onClose={() => setSelectedInventory(null)}
        onSubmit={updateInventory}
        submitting={submitting}
      />
      <ConfirmModal
        isOpen={inventoryToDeactivate !== null}
        title="Deactivate Inventory"
        message={
          inventoryToDeactivate
            ? `Are you sure you want to deactivate ${inventoryToDeactivate.name}?`
            : ""
        }
        confirmText="Deactivate"
        cancelText="Cancel"
        loading={submitting}
        onCancel={() => setInventoryToDeactivate(null)}
        onConfirm={async () => {
          if (!inventoryToDeactivate) {
            return;
          }

          await deactivateInventory(inventoryToDeactivate._id);

          setInventoryToDeactivate(null);
        }}
      />
    </div>
  );
};

export default Inventory;
