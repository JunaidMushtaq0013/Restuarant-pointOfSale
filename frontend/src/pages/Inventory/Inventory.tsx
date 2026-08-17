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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedInventory, setSelectedInventory] =
    useState<InventoryItem | null>(null);

  const [inventoryToDeactivate, setInventoryToDeactivate] =
    useState<InventoryItem | null>(null);

  const [inactiveInventory, setInactiveInventory] = useState<
    InventoryItem[]
  >([]);

  const [showInactive, setShowInactive] = useState(false);

  const { user } = useAuth();

  const getInventory = async (currentPage: number) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/inventory?page=${currentPage}&limit=10`,
      );

      setInventory(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInventory(page);
  }, [page]);

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

      // Refresh current page so pagination remains correct
      await getInventory(page);

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

      // Refresh current page
      await getInventory(page);
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

      // Refresh active inventory
      await getInventory(page);

      // Keep response variable used if backend response changes later
      console.log(response.data);
    } catch (error) {
      console.error("Failed to activate inventory item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    setPage(newPage);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-sm text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage restaurant inventory
          </p>
        </div>

        {user?.role === "Manager" && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={getInactiveInventory}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Inactive Inventory
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
            >
              + Add Inventory
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-4 font-medium sm:px-6">Name</th>
                <th className="px-4 py-4 font-medium sm:px-6">Type</th>
                <th className="px-4 py-4 font-medium sm:px-6">Quantity</th>
                <th className="px-4 py-4 font-medium sm:px-6">
                  Minimum Stock
                </th>
                <th className="px-4 py-4 font-medium sm:px-6">
                  Buying Price
                </th>
                <th className="px-4 py-4 font-medium sm:px-6">Status</th>
                <th className="px-4 py-4 font-medium sm:px-6">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const isLowStock = item.quantity <= item.minimumStock;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900 sm:px-6">
                        {item.name}
                      </td>

                      <td className="px-4 py-4 text-gray-600 sm:px-6">
                        {item.itemType}
                      </td>

                      <td className="px-4 py-4 text-gray-600 sm:px-6">
                        {item.quantity} {item.unit}
                      </td>

                      <td className="px-4 py-4 text-gray-600 sm:px-6">
                        {item.minimumStock} {item.unit}
                      </td>

                      <td className="px-4 py-4 text-gray-600 sm:px-6">
                        ₹{item.buyingPrice.toFixed(2)}
                      </td>

                      <td className="px-4 py-4 sm:px-6">
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

                      <td className="px-4 py-4 sm:px-6">
                        {user?.role === "Manager" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedInventory(item)}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                setInventoryToDeactivate(item)
                              }
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-gray-500">
              Showing page {pagination.currentPage} of{" "}
              {pagination.totalPages} ({pagination.totalItems} items)
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white">
                {page}
              </span>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Inactive Inventory */}
        {showInactive && (
          <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
                className="self-start text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-4 font-medium sm:px-6">Name</th>
                    <th className="px-4 py-4 font-medium sm:px-6">Type</th>
                    <th className="px-4 py-4 font-medium sm:px-6">Unit</th>
                    <th className="px-4 py-4 font-medium sm:px-6">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {inactiveInventory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        No inactive inventory items.
                      </td>
                    </tr>
                  ) : (
                    inactiveInventory.map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-4 font-medium text-gray-900 sm:px-6">
                          {item.name}
                        </td>

                        <td className="px-4 py-4 text-gray-600 sm:px-6">
                          {item.itemType}
                        </td>

                        <td className="px-4 py-4 text-gray-600 sm:px-6">
                          {item.unit}
                        </td>

                        <td className="px-4 py-4 sm:px-6">
                          <button
                            onClick={() => activateInventory(item._id)}
                            disabled={submitting}
                            className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                          >
                            Activate
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
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