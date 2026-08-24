import { useEffect, useState } from "react";
import api from "../../api/axious";

import AddEmployeeModal from "../../components/employee/AddEmployeeModal";
import EditEmployeeModal from "../../components/employee/EditEmployeeModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import ActionIcon from "../../components/common/ActionIcon";

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "Manager" | "Cashier" | "Chef" | "Waiter";
  isActive: boolean;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Add Employee
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Edit Employee
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editSubmitting, setEditSubmitting] = useState(false);

  // Deactivate Employee
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [employeeToDeactivate, setEmployeeToDeactivate] =
    useState<Employee | null>(null);

  const [deactivateSubmitting, setDeactivateSubmitting] = useState(false);

  // Activate Employee
  const [activateSubmitting, setActivateSubmitting] = useState<string | null>(
    null,
  );

  // --------------------------------
  // GET EMPLOYEES
  // --------------------------------

  const getEmployees = async () => {
    try {
      setLoading(true);

      const response = await api.get("/employees");

      setEmployees(response.data.data);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  // --------------------------------
  // SEARCH
  // --------------------------------

  const filteredEmployees = employees.filter((employee) => {
    const value = search.toLowerCase();

    return (
      employee.name.toLowerCase().includes(value) ||
      employee.email.toLowerCase().includes(value) ||
      employee.phone.includes(value) ||
      employee.role.toLowerCase().includes(value)
    );
  });

  // --------------------------------
  // CREATE EMPLOYEE
  // --------------------------------

  const createEmployee = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: "Manager" | "Cashier" | "Chef" | "Waiter",
  ) => {
    try {
      setSubmitting(true);

      const response = await api.post("/employees", {
        name,
        email,
        phone,
        password,
        role,
      });

      setEmployees((prevEmployees) => [response.data.data, ...prevEmployees]);

      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to create employee:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------
  // UPDATE EMPLOYEE
  // --------------------------------

  const updateEmployee = async (
    id: string,
    name: string,
    email: string,
    phone: string,
    role: "Manager" | "Cashier" | "Chef" | "Waiter",
  ) => {
    try {
      setEditSubmitting(true);

      const response = await api.patch(`/employees/${id}`, {
        name,
        email,
        phone,
        role,
      });

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee._id === id ? response.data.data : employee,
        ),
      );

      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Failed to update employee:", error);
    } finally {
      setEditSubmitting(false);
    }
  };

  // --------------------------------
  // DEACTIVATE EMPLOYEE
  // --------------------------------

  const deactivateEmployee = async () => {
    if (!employeeToDeactivate) {
      return;
    }

    try {
      setDeactivateSubmitting(true);

      const response = await api.patch(
        `/employees/${employeeToDeactivate._id}/status`,
      );

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee._id === employeeToDeactivate._id
            ? response.data.data
            : employee,
        ),
      );

      setShowConfirmModal(false);
      setEmployeeToDeactivate(null);
    } catch (error) {
      console.error("Failed to deactivate employee:", error);
    } finally {
      setDeactivateSubmitting(false);
    }
  };

  // --------------------------------
  // ACTIVATE EMPLOYEE
  // --------------------------------

  const activateEmployee = async (id: string) => {
    try {
      setActivateSubmitting(id);

      const response = await api.patch(`/employees/${id}/activate`);

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee._id === id ? response.data.data : employee,
        ),
      );
    } catch (error) {
      console.error("Failed to activate employee:", error);
    } finally {
      setActivateSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage restaurant employees and their roles
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary sm:w-auto w-full"
        >
          + Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or role..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* ================= MOBILE EMPLOYEE CARDS ================= */}
      <div className="space-y-3 sm:hidden">
        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
            Loading employees...
          </div>
        ) : filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div
              key={employee._id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              {/* Name + Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-gray-900">
                    {employee.name}
                  </h3>

                  <p className="mt-1 break-all text-sm text-gray-500">
                    {employee.email}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    employee.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {employee.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Employee Details */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-400">Phone</p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {employee.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Role</p>

                  <span className="mt-1 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {employee.role}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                {/* EDIT */}
                {employee.isActive && (
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <ActionIcon label="Edit" />
                  </button>
                )}

                {/* DEACTIVATE */}
                {employee.isActive && (
                  <button
                    onClick={() => {
                      setEmployeeToDeactivate(employee);
                      setShowConfirmModal(true);
                    }}
                    className="flex-1 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <ActionIcon label="Deactivate" />
                  </button>
                )}

                {/* ACTIVATE */}
                {!employee.isActive && (
                  <button
                    onClick={() => activateEmployee(employee._id)}
                    disabled={activateSubmitting === employee._id}
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
            No employees found.
          </div>
        )}
      </div>

      {/* ================= DESKTOP EMPLOYEE TABLE ================= */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-600">Name</th>

                <th className="px-6 py-4 font-medium text-gray-600">Email</th>

                <th className="px-6 py-4 font-medium text-gray-600">Phone</th>

                <th className="px-6 py-4 font-medium text-gray-600">Role</th>

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
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {employee.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {employee.email}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {employee.phone}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {employee.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          employee.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {/* EDIT */}
                        {employee.isActive && (
                          <button
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsEditModalOpen(true);
                            }}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <ActionIcon label="Edit" />
                          </button>
                        )}

                        {/* DEACTIVATE */}
                        {employee.isActive && (
                          <button
                            onClick={() => {
                              setEmployeeToDeactivate(employee);
                              setShowConfirmModal(true);
                            }}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            <ActionIcon label="Deactivate" />
                          </button>
                        )}

                        {/* ACTIVATE */}
                        {!employee.isActive && (
                          <button
                            onClick={() => activateEmployee(employee._id)}
                            disabled={activateSubmitting === employee._id}
                            className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EMPLOYEE */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={createEmployee}
        submitting={submitting}
      />

      {/* EDIT EMPLOYEE */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        employee={selectedEmployee}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={updateEmployee}
        submitting={editSubmitting}
      />

      {/* DEACTIVATE CONFIRMATION */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Deactivate Employee"
        message={`Are you sure you want to deactivate "${employeeToDeactivate?.name}"?`}
        confirmText="Deactivate"
        cancelText="Cancel"
        loading={deactivateSubmitting}
        onConfirm={deactivateEmployee}
        onCancel={() => {
          setShowConfirmModal(false);
          setEmployeeToDeactivate(null);
        }}
      />
    </div>
  );
};

export default Employees;
