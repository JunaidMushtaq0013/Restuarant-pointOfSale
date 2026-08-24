import { useEffect, useState } from "react";
import api from "../../api/axious";
import { useAuth } from "../../context/AuthContext";

import AddInventoryModal from "../../components/inventory/AddInventoryModal";
import EditInventoryModal from "../../components/inventory/EditInventoryModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import ActionIcon from "../../components/common/ActionIcon";

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
  const { user } = useAuth();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inactiveInventory, setInactiveInventory] = useState<InventoryItem[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [loadingInactive, setLoadingInactive] = useState(false);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedInventory, setSelectedInventory] =
    useState<InventoryItem | null>(null);

  const [inventoryToDeactivate, setInventoryToDeactivate] =
    useState<InventoryItem | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [showInactive, setShowInactive] = useState(false);

  /*
   * =========================================================
   * GET ACTIVE INVENTORY
   * =========================================================
   */

  const getInventory = async (currentPage: number) => {
    try {
      setLoading(true);

      const response = await api.get("/inventory", {
        params: {
          page: currentPage,
          limit: 10,
        },
      });

      setInventory(response.data.data);

      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * INITIAL LOAD / PAGE CHANGE
   * =========================================================
   */

  useEffect(() => {
    getInventory(page);
  }, [page]);

  /*
   * =========================================================
   * CREATE INVENTORY
   * =========================================================
   */

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

      await api.post("/inventory", {
        name,
        itemType,
        unit,
        quantity,
        minimumStock,
        buyingPrice,
      });

      await getInventory(page);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create inventory item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =========================================================
   * UPDATE INVENTORY
   * =========================================================
   */

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

  /*
   * =========================================================
   * DEACTIVATE INVENTORY
   * =========================================================
   */

  const deactivateInventory = async (id: string) => {
    try {
      setSubmitting(true);

      await api.delete(`/inventory/${id}`);

      await getInventory(page);

      setInventoryToDeactivate(null);
    } catch (error) {
      console.error("Failed to deactivate inventory item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =========================================================
   * GET INACTIVE INVENTORY
   * =========================================================
   */

  const getInactiveInventory = async () => {
    try {
      setLoadingInactive(true);

      const response = await api.get("/inventory/inactive");

      setInactiveInventory(response.data.data);

      setShowInactive(true);
    } catch (error) {
      console.error("Failed to load inactive inventory:", error);
    } finally {
      setLoadingInactive(false);
    }
  };

  /*
   * =========================================================
   * ACTIVATE INVENTORY
   * =========================================================
   */

  const activateInventory = async (id: string) => {
    try {
      setSubmitting(true);

      await api.patch(`/inventory/${id}/activate`);

      setInactiveInventory((prevInventory) =>
        prevInventory.filter((item) => item._id !== id),
      );

      await getInventory(page);
    } catch (error) {
      console.error("Failed to activate inventory item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =========================================================
   * PAGINATION
   * =========================================================
   */

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    setPage(newPage);
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="w-full p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-gray-200" />

          <div className="h-4 w-64 rounded bg-gray-200" />

          <div className="h-40 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage restaurant inventory and stock levels.
          </p>
        </div>

        {user?.role === "Manager" && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={getInactiveInventory}
              disabled={loadingInactive}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingInactive ? "Loading..." : "Inactive Inventory"}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              + Add Inventory
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Items</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {pagination.totalItems}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Current Page</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {pagination.currentPage}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            of {pagination.totalPages} pages
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Low Stock</p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {
              inventory.filter((item) => item.quantity <= item.minimumStock)
                .length
            }
          </p>
        </div>
      </div>

      {/* =====================================================
          DESKTOP TABLE
      ====================================================== */}

      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
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

                {user?.role === "Manager" && (
                  <th className="px-6 py-4 font-medium">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y">
              {inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={user?.role === "Manager" ? 7 : 6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const isLowStock = item.quantity <= item.minimumStock;

                  return (
                    <tr key={item._id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {item.itemType}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.quantity}{" "}
                        <span className="text-gray-500">{item.unit}</span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {item.minimumStock} {item.unit}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
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

                      {user?.role === "Manager" && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedInventory(item)}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              <ActionIcon label="Edit" />
                            </button>

                            <button
                              onClick={() => setInventoryToDeactivate(item)}
                              disabled={submitting}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <ActionIcon label="Deactivate" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          MOBILE CARDS
      ====================================================== */}

      <div className="space-y-3 md:hidden">
        {inventory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">No inventory items found.</p>
          </div>
        ) : (
          inventory.map((item) => {
            const isLowStock = item.quantity <= item.minimumStock;

            return (
              <div
                key={item._id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                {/* Card Header */}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">
                      {item.name}
                    </h3>

                    <span className="mt-2 inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {item.itemType}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      isLowStock
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isLowStock ? "Low Stock" : "In Stock"}
                  </span>
                </div>

                {/* Details */}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Quantity</p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {item.quantity} {item.unit}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Minimum Stock</p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {item.minimumStock} {item.unit}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Buying Price</p>

                    <p className="mt-1 font-semibold text-gray-900">
                      ₹{item.buyingPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Actions */}

                {user?.role === "Manager" && (
                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setSelectedInventory(item)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <ActionIcon label="Edit" />
                    </button>

                    <button
                      onClick={() => setInventoryToDeactivate(item)}
                      disabled={submitting}
                      className="flex-1 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <ActionIcon label="Deactivate" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* =====================================================
          PAGINATION
      ====================================================== */}

      {pagination.totalPages > 1 && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-gray-500 sm:text-left">
              Showing page{" "}
              <span className="font-medium text-gray-900">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-gray-900 px-3 text-sm font-medium text-white">
                {page}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          INACTIVE INVENTORY
      ====================================================== */}

      {showInactive && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Inactive Inventory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Items that are currently deactivated.
              </p>
            </div>

            <button
              onClick={() => setShowInactive(false)}
              className="self-start rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          {/* Desktop inactive table */}

          <div className="hidden overflow-x-auto md:block">
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
                {inactiveInventory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No inactive inventory items.
                    </td>
                  </tr>
                ) : (
                  inactiveInventory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile inactive cards */}

          <div className="space-y-3 p-4 md:hidden">
            {inactiveInventory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                No inactive inventory items.
              </div>
            ) : (
              inactiveInventory.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.itemType} • {item.unit}
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                      Inactive
                    </span>
                  </div>

                  <button
                    onClick={() => activateInventory(item._id)}
                    disabled={submitting}
                    className="mt-4 w-full rounded-lg border border-green-200 bg-white px-3 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                  >
                    Activate
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          MODALS
      ====================================================== */}

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
        }}
      />
    </div>
  );
};

export default Inventory;
