import { useEffect, useState } from "react";
import api from "../../api/axious";
import AddCategoryModal from "../../components/category/AddCategoryModal";
import EditCategoryModal from "../../components/category/EditCategoryModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import ActionIcon from "../../components/common/ActionIcon";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showInactive, setShowInactive] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editSubmitting, setEditSubmitting] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [categoryToDeactivate, setCategoryToDeactivate] =
    useState<Category | null>(null);

  const [deactivateSubmitting, setDeactivateSubmitting] = useState(false);

  const [activateSubmitting, setActivateSubmitting] = useState(false);

  // --------------------------------
  // GET CATEGORIES
  // --------------------------------

  const getCategories = async () => {
    try {
      setLoading(true);

      const endpoint = showInactive ? "/categories/inactive" : "/categories";

      const response = await api.get(endpoint, {
        params: {
          search: search || undefined,
        },
      });

      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, [showInactive]);

  // --------------------------------
  // ADD CATEGORY
  // --------------------------------

  const createCategory = async (name: string, description: string) => {
    try {
      setSubmitting(true);

      const response = await api.post("/categories", {
        name,
        description,
      });

      if (!showInactive) {
        setCategories((prevCategories) => [
          response.data.data,
          ...prevCategories,
        ]);
      }

      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------
  // UPDATE CATEGORY
  // --------------------------------

  const updateCategory = async (
    id: string,
    name: string,
    description: string,
  ) => {
    try {
      setEditSubmitting(true);

      const response = await api.patch(`/categories/${id}`, {
        name,
        description,
      });

      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category._id === id ? response.data.data : category,
        ),
      );

      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setEditSubmitting(false);
    }
  };

  // --------------------------------
  // DEACTIVATE CATEGORY
  // --------------------------------

  const confirmDeactivate = async () => {
    if (!categoryToDeactivate) {
      return;
    }

    try {
      setDeactivateSubmitting(true);

      await api.delete(`/categories/${categoryToDeactivate._id}`);

      setCategories((prevCategories) =>
        prevCategories.filter(
          (category) => category._id !== categoryToDeactivate._id,
        ),
      );

      setShowConfirmModal(false);
      setCategoryToDeactivate(null);
    } catch (error) {
      console.error("Failed to deactivate category:", error);
    } finally {
      setDeactivateSubmitting(false);
    }
  };

  // --------------------------------
  // ACTIVATE CATEGORY
  // --------------------------------

  const activateCategory = async (id: string) => {
    try {
      setActivateSubmitting(true);

      await api.patch(`/categories/${id}/activate`);

      setCategories((prevCategories) =>
        prevCategories.filter((category) => category._id !== id),
      );
    } catch (error) {
      console.error("Failed to activate category:", error);
    } finally {
      setActivateSubmitting(false);
    }
  };

  // --------------------------------
  // SEARCH
  // --------------------------------

  const handleSearch = () => {
    getCategories();
  };

  // --------------------------------
  // RENDER
  // --------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your menu categories
          </p>
        </div>

        {!showInactive && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary sm:w-auto w-full"
          >
            + Add Category
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={() => {
            setShowInactive(false);
            setSearch("");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            !showInactive
              ? "bg-[#221b18] text-[#f0d9b6]"
              : "border border-[#d9c9b3] bg-white text-[#4a3f38] hover:bg-[#f9f6f2]"
          }`}
        >
          Active Categories
        </button>

        <button
          onClick={() => {
            setShowInactive(true);
            setSearch("");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            showInactive
              ? "bg-[#221b18] text-[#f0d9b6]"
              : "border border-[#d9c9b3] bg-white text-[#4a3f38] hover:bg-[#f9f6f2]"
          }`}
        >
          Inactive Categories
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search categories..."
          className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
        />

        <button
          onClick={handleSearch}
          className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
        >
          Search
        </button>
      </div>

      {/* ================= MOBILE CATEGORY CARDS ================= */}
      <div className="space-y-3 sm:hidden">
        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            Loading categories...
          </div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category._id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              {/* Name + Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-gray-900">
                    {category.name}
                  </h3>

                  <p className="mt-1 break-words text-sm text-gray-500">
                    {category.description || "No description"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    category.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                {category.isActive ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsEditModalOpen(true);
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <ActionIcon label="Edit" />
                    </button>

                    <button
                      onClick={() => {
                        setCategoryToDeactivate(category);
                        setShowConfirmModal(true);
                      }}
                      className="flex-1 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <ActionIcon label="Deactivate" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => activateCategory(category._id)}
                    disabled={activateSubmitting}
                    className="w-full rounded-lg border border-green-200 px-3 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ActionIcon label="Activate" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            No categories found.
          </div>
        )}
      </div>

      {/* ================= DESKTOP CATEGORY TABLE ================= */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-600">Name</th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Description
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">Status</th>

                <th className="px-6 py-4 text-right font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {category.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {category.description || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          category.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {category.isActive ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsEditModalOpen(true);
                              }}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              aria-label="Edit category"
                            >
                              <ActionIcon label="Edit" />
                            </button>

                            <button
                              onClick={() => {
                                setCategoryToDeactivate(category);
                                setShowConfirmModal(true);
                              }}
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                              aria-label="Deactivate category"
                            >
                              <ActionIcon label="Deactivate" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => activateCategory(category._id)}
                            disabled={activateSubmitting}
                            className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                            aria-label="Activate category"
                          >
                            <ActionIcon label="Activate" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={createCategory}
        submitting={submitting}
      />

      {/* Edit Modal */}
      <EditCategoryModal
        isOpen={isEditModalOpen}
        category={selectedCategory}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={updateCategory}
        submitting={editSubmitting}
      />

      {/* Deactivate Confirmation */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Deactivate Category"
        message={`Are you sure you want to deactivate "${categoryToDeactivate?.name}"?`}
        confirmText="Deactivate"
        cancelText="Cancel"
        loading={deactivateSubmitting}
        onConfirm={confirmDeactivate}
        onCancel={() => {
          setShowConfirmModal(false);
          setCategoryToDeactivate(null);
        }}
      />
    </div>
  );
};

export default Categories;
