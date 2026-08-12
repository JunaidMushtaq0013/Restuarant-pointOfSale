import { useEffect, useState } from "react";
import api from "../../api/axious";
import AddMenuModal from "../../components/menu/AddMenuModal";
import EditMenuModal from "../../components/menu/EditMenuModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useAuth } from "../../context/AuthContext";

interface Category {
  _id: string;
  name: string;
  description?: string;
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
  inventory: InventoryItem;
  category: Category;
  sellingPrice: number;
  type: "Veg" | "Non-Veg";
  isActive: boolean;
}

const Menu = () => {
  const { user } = useAuth();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedMenuItem, setSelectedMenuItem] =
    useState<MenuItem | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] =
    useState(false);

  const [confirmLoading, setConfirmLoading] = useState(false);

  const [actionType, setActionType] = useState<
    "toggle" | "delete" | null
  >(null);

  const isManager = user?.role === "Manager";

  // ----------------------------------------
  // GET MENU
  // ----------------------------------------

  const getMenu = async () => {
    try {
      setLoading(true);

      const response = await api.get("/menu");

      setMenuItems(response.data.data);
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMenu();
  }, []);

  // ----------------------------------------
  // CREATE MENU ITEM
  // ----------------------------------------

  const createMenuItem = async (
    name: string,
    description: string,
    category: string,
    inventory: string,
    sellingPrice: number,
    type: "Veg" | "Non-Veg",
  ) => {
    try {
      setSubmitting(true);

      const response = await api.post("/menu", {
        name,
        description,
        category,
        inventory,
        sellingPrice,
        type,
      });

      setMenuItems((prev) => [
        response.data.data,
        ...prev,
      ]);

      setIsAddModalOpen(false);
    } catch (error) {
      console.error(
        "Failed to create menu item:",
        error,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------
  // UPDATE MENU ITEM
  // ----------------------------------------

  const updateMenuItem = async (
    id: string,
    name: string,
    description: string,
    category: string,
    inventory: string,
    sellingPrice: number,
    type: "Veg" | "Non-Veg",
  ) => {
    try {
      setEditSubmitting(true);

      const response = await api.patch(
        `/menu/${id}`,
        {
          name,
          description,
          category,
          inventory,
          sellingPrice,
          type,
        },
      );

      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === id
            ? response.data.data
            : item,
        ),
      );

      setIsEditModalOpen(false);
      setSelectedMenuItem(null);
    } catch (error) {
      console.error(
        "Failed to update menu item:",
        error,
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  // ----------------------------------------
  // OPEN TOGGLE CONFIRMATION
  // ----------------------------------------

  const openToggleConfirmation = (
    menuItem: MenuItem,
  ) => {
    setSelectedMenuItem(menuItem);
    setActionType("toggle");
    setIsConfirmModalOpen(true);
  };

  // ----------------------------------------
  // OPEN DELETE CONFIRMATION
  // ----------------------------------------

  const openDeleteConfirmation = (
    menuItem: MenuItem,
  ) => {
    setSelectedMenuItem(menuItem);
    setActionType("delete");
    setIsConfirmModalOpen(true);
  };

  // ----------------------------------------
  // TOGGLE ACTIVE / INACTIVE
  // ----------------------------------------

  const toggleMenuItem = async () => {
    if (!selectedMenuItem) {
      return;
    }

    try {
      setConfirmLoading(true);

      const response = await api.patch(
        `/menu/${selectedMenuItem._id}/toggle-active`,
      );

      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === selectedMenuItem._id
            ? response.data.data
            : item,
        ),
      );

      setIsConfirmModalOpen(false);
      setSelectedMenuItem(null);
      setActionType(null);
    } catch (error) {
      console.error(
        "Failed to change menu item status:",
        error,
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  // ----------------------------------------
  // DELETE MENU ITEM
  // ----------------------------------------

  const deleteMenuItem = async () => {
    if (!selectedMenuItem) {
      return;
    }

    try {
      setConfirmLoading(true);

      await api.delete(
        `/menu/${selectedMenuItem._id}`,
      );

      setMenuItems((prev) =>
        prev.filter(
          (item) =>
            item._id !== selectedMenuItem._id,
        ),
      );

      setIsConfirmModalOpen(false);
      setSelectedMenuItem(null);
      setActionType(null);
    } catch (error) {
      console.error(
        "Failed to delete menu item:",
        error,
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  // ----------------------------------------
  // CONFIRM ACTION
  // ----------------------------------------

  const handleConfirm = async () => {
    if (actionType === "toggle") {
      await toggleMenuItem();
      return;
    }

    if (actionType === "delete") {
      await deleteMenuItem();
    }
  };

  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  const filteredMenu = menuItems.filter((item) => {
    const searchValue = search.toLowerCase();

    return (
      item.name
        .toLowerCase()
        .includes(searchValue) ||
      item.category?.name
        .toLowerCase()
        .includes(searchValue) ||
      item.type
        .toLowerCase()
        .includes(searchValue)
    );
  });

  // ----------------------------------------
  // LOADING
  // ----------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Loading menu...
        </p>
      </div>
    );
  }

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Menu
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your restaurant menu items
          </p>
        </div>

        {isManager && (
          <button
            type="button"
            onClick={() =>
              setIsAddModalOpen(true)
            }
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add Menu Item
          </button>
        )}
      </div>

      {/* Search */}

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search menu items..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* Menu Table */}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="border-b bg-gray-50">

              <tr>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Name
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Category
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Type
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Price
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Status
                </th>

                {isManager && (
                  <th className="px-6 py-4 text-right font-medium text-gray-600">
                    Actions
                  </th>
                )}

              </tr>

            </thead>

            <tbody className="divide-y">

              {filteredMenu.length > 0 ? (

                filteredMenu.map((item) => (

                  <tr
                    key={item._id}
                    className="hover:bg-gray-50"
                  >

                    {/* Name */}

                    <td className="px-6 py-4">

                      <div>
                        <p className="font-medium text-gray-900">
                          {item.name}
                        </p>

                        {item.description && (
                          <p className="mt-1 text-xs text-gray-500">
                            {item.description}
                          </p>
                        )}
                      </div>

                    </td>

                    {/* Category */}

                    <td className="px-6 py-4 text-gray-600">
                      {item.category?.name || "—"}
                    </td>

                    {/* Type */}

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.type === "Veg"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.type}
                      </span>

                    </td>

                    {/* Price */}

                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹
                      {Number(
                        item.sellingPrice,
                      ).toFixed(2)}
                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    {/* Actions */}

                    {isManager && (
                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          {/* Edit */}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMenuItem(item);
                              setIsEditModalOpen(true);
                            }}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          {/* Activate / Deactivate */}

                          <button
                            type="button"
                            onClick={() =>
                              openToggleConfirmation(item)
                            }
                            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                              item.isActive
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {item.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() =>
                              openDeleteConfirmation(item)
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </div>

                      </td>
                    )}

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={isManager ? 6 : 5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No menu items found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Add Menu Modal */}

      <AddMenuModal
        isOpen={isAddModalOpen}
        onClose={() =>
          setIsAddModalOpen(false)
        }
        onSubmit={createMenuItem}
        submitting={submitting}
      />

      {/* Edit Menu Modal */}

      <EditMenuModal
        isOpen={isEditModalOpen}
        menuItem={selectedMenuItem}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMenuItem(null);
        }}
        onSubmit={updateMenuItem}
        submitting={editSubmitting}
      />

      {/* Confirmation Modal */}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title={
          actionType === "delete"
            ? "Delete Menu Item"
            : selectedMenuItem?.isActive
              ? "Deactivate Menu Item"
              : "Activate Menu Item"
        }
        message={
          actionType === "delete"
            ? `Are you sure you want to delete "${selectedMenuItem?.name}"? This action cannot be undone.`
            : selectedMenuItem?.isActive
              ? `Are you sure you want to deactivate "${selectedMenuItem?.name}"?`
              : `Are you sure you want to activate "${selectedMenuItem?.name}"?`
        }
        confirmText={
          actionType === "delete"
            ? "Delete"
            : selectedMenuItem?.isActive
              ? "Deactivate"
              : "Activate"
        }
        cancelText="Cancel"
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (confirmLoading) {
            return;
          }

          setIsConfirmModalOpen(false);
          setSelectedMenuItem(null);
          setActionType(null);
        }}
      />

    </div>
  );
};

export default Menu;