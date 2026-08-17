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
  image?: string;
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const itemsPerPage = 10;

  const [selectedMenuItem, setSelectedMenuItem] =
    useState<MenuItem | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [actionType, setActionType] = useState<
    "toggle" | "delete" | null
  >(null);

  const isManager = user?.role === "Manager";

  // ----------------------------------------
  // GET MENU
  // ----------------------------------------

  const getMenu = async (page = 1) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/menu?page=${page}&limit=${itemsPerPage}`,
      );

      setMenuItems(response.data.data);

      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.total);
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMenu(1);
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
    image: File | null,
  ) => {
    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("inventory", inventory);
      formData.append("sellingPrice", sellingPrice.toString());
      formData.append("type", type);

      if (image) {
        formData.append("image", image);
      }

      await api.post("/menu", formData);

      setIsAddModalOpen(false);

      // Reload current page from database
      await getMenu(currentPage);
    } catch (error) {
      console.error("Failed to create menu item:", error);
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
    image: File | null,
  ) => {
    try {
      setEditSubmitting(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("inventory", inventory);
      formData.append("sellingPrice", sellingPrice.toString());
      formData.append("type", type);

      if (image) {
        formData.append("image", image);
      }

      await api.patch(`/menu/${id}`, formData);

      setIsEditModalOpen(false);
      setSelectedMenuItem(null);

      await getMenu(currentPage);
    } catch (error) {
      console.error("Failed to update menu item:", error);
    } finally {
      setEditSubmitting(false);
    }
  };

  // ----------------------------------------
  // OPEN TOGGLE CONFIRMATION
  // ----------------------------------------

  const openToggleConfirmation = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setActionType("toggle");
    setIsConfirmModalOpen(true);
  };

  // ----------------------------------------
  // OPEN DELETE CONFIRMATION
  // ----------------------------------------

  const openDeleteConfirmation = (menuItem: MenuItem) => {
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

      await api.patch(
        `/menu/${selectedMenuItem._id}/toggle-active`,
      );

      setIsConfirmModalOpen(false);
      setSelectedMenuItem(null);
      setActionType(null);

      await getMenu(currentPage);
    } catch (error) {
      console.error("Failed to change menu item status:", error);
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

      await api.delete(`/menu/${selectedMenuItem._id}`);

      setIsConfirmModalOpen(false);
      setSelectedMenuItem(null);
      setActionType(null);

      // If deleting the last item on the current page,
      // move back one page when possible.
      if (menuItems.length === 1 && currentPage > 1) {
        await getMenu(currentPage - 1);
      } else {
        await getMenu(currentPage);
      }
    } catch (error) {
      console.error("Failed to delete menu item:", error);
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
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      item.name.toLowerCase().includes(searchValue) ||
      item.category?.name?.toLowerCase().includes(searchValue) ||
      item.type.toLowerCase().includes(searchValue)
    );
  });

  // ----------------------------------------
  // PAGE CHANGE
  // ----------------------------------------

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setSearch("");
    getMenu(page);
  };

  // ----------------------------------------
  // LOADING
  // ----------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading menu...</p>
      </div>
    );
  }

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <div className="w-full space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            onClick={() => setIsAddModalOpen(true)}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* Desktop Table */}

      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
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
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl">
                            🍽️
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>

                          {item.description && (
                            <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>
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
                      ₹{Number(item.sellingPrice).toFixed(2)}
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

      {/* Mobile Cards */}

      <div className="space-y-4 md:hidden">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              {/* Image + Name */}

              <div className="flex items-start gap-3">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                    🍽️
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {item.name}
                  </h3>

                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Details */}

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {item.category?.name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Price
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    ₹{Number(item.sellingPrice).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Type
                  </p>

                  <div className="mt-1">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.type === "Veg"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Status
                  </p>

                  <div className="mt-1">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}

              {isManager && (
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMenuItem(item);
                      setIsEditModalOpen(true);
                    }}
                    className="rounded-lg border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openToggleConfirmation(item)
                    }
                    className={`rounded-lg border px-2 py-2 text-xs font-medium ${
                      item.isActive
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {item.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openDeleteConfirmation(item)
                    }
                    className="rounded-lg border border-red-200 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-10 text-center text-gray-500 shadow-sm">
            No menu items found.
          </div>
        )}
      </div>

      {/* Pagination */}

      {totalItems > 0 && (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-gray-500 sm:text-left">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                totalItems,
              )}
            </span>{" "}
            to{" "}
            <span className="font-medium text-gray-700">
              {Math.min(
                currentPage * itemsPerPage,
                totalItems,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">
              {totalItems}
            </span>{" "}
            items
          </p>

          <div className="flex items-center justify-center gap-2">
            {/* Previous */}

            <button
              type="button"
              disabled={currentPage === 1 || loading}
              onClick={() =>
                goToPage(currentPage - 1)
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {/* Page Numbers */}

            <div className="flex items-center gap-1">
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1,
              )
                .filter((page) => {
                  if (totalPages <= 5) {
                    return true;
                  }

                  if (page === 1 || page === totalPages) {
                    return true;
                  }

                  return (
                    page >= currentPage - 1 &&
                    page <= currentPage + 1
                  );
                })
                .map((page, index, pages) => {
                  const previousPage =
                    pages[index - 1];

                  const showDots =
                    previousPage &&
                    page - previousPage > 1;

                  return (
                    <div
                      key={page}
                      className="flex items-center gap-1"
                    >
                      {showDots && (
                        <span className="px-1 text-gray-400">
                          ...
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          goToPage(page)
                        }
                        disabled={loading}
                        className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium ${
                          currentPage === page
                            ? "bg-gray-900 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Next */}

            <button
              type="button"
              disabled={
                currentPage === totalPages ||
                loading
              }
              onClick={() =>
                goToPage(currentPage + 1)
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Menu Modal */}

      <AddMenuModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
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