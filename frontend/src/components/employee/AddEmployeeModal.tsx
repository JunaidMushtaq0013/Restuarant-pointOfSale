import { useState } from "react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: "Manager" | "Cashier" | "Chef" | "Waiter",
  ) => Promise<void>;
  submitting: boolean;
}

const AddEmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: AddEmployeeModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<
    "Manager" | "Cashier" | "Chef" | "Waiter"
  >("Cashier");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim()
    ) {
      return;
    }

    await onSubmit(
      name.trim(),
      email.trim(),
      phone.trim(),
      password,
      role,
    );

    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("Cashier");
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("Cashier");

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Employee
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add a new restaurant employee.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="employeeName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <input
              id="employeeName"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter employee name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="employeeEmail"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="employeeEmail"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter employee email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="employeePhone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone
            </label>

            <input
              id="employeePhone"
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="employeePassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="employeePassword"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter temporary password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="employeeRole"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Role
            </label>

            <select
              id="employeeRole"
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
              onClick={handleClose}
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
                ? "Adding..."
                : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;