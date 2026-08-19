import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "Manager" | "Cashier" | "Chef" | "Waiter";
  isActive: boolean;
}

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    name: string,
    email: string,
    phone: string,
    role: "Manager" | "Cashier" | "Chef" | "Waiter",
  ) => Promise<void>;
  submitting: boolean;
}

const EditEmployeeModal = ({
  isOpen,
  employee,
  onClose,
  onSubmit,
  submitting,
}: EditEmployeeModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<
    "Manager" | "Cashier" | "Chef" | "Waiter"
  >("Cashier");

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setPhone(employee.phone);
      setRole(employee.role);
    }
  }, [employee]);

  if (!isOpen || !employee) {
    return null;
  }

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      return;
    }

    await onSubmit(
      employee._id,
      name.trim(),
      email.trim(),
      phone.trim(),
      role,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Employee
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update employee information and role.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="editEmployeeName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <input
              id="editEmployeeName"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="editEmployeeEmail"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="editEmployeeEmail"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="editEmployeePhone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone
            </label>

            <input
              id="editEmployeePhone"
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="editEmployeeRole"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Role
            </label>

            <select
              id="editEmployeeRole"
              value={role}
              onChange={(e) =>
                setRole(
                  e.target.value as
                    | "Manager"
                    | "Cashier"
                    | "Chef"
                    | "Waiter",
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            >
              <option value="Manager">
                Manager
              </option>

              <option value="Cashier">
                Cashier
              </option>

              <option value="Chef">
                Chef
              </option>

              <option value="Waiter">
                Waiter
              </option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
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
              disabled={submitting}
              className="btn-primary"
            >
              {submitting
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;