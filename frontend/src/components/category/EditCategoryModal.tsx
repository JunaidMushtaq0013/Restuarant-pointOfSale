import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    name: string,
    description: string,
  ) => Promise<void>;
  submitting: boolean;
}

const EditCategoryModal = ({
  isOpen,
  category,
  onClose,
  onSubmit,
  submitting,
}: EditCategoryModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
    }
  }, [category]);

  if (!isOpen || !category) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    await onSubmit(
      category._id,
      name.trim(),
      description.trim(),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Category
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update the category details.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="editCategoryName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category Name
            </label>

            <input
              id="editCategoryName"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="editCategoryDescription"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="editCategoryDescription"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;