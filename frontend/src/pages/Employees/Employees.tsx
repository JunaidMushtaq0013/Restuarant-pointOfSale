import { useEffect, useState } from "react";
import api from "../../api/axious";
import AddEmployeeModal from "../../components/employee/AddEmployeeModal";
import EditEmployeeModal from "../../components/employee/EditEmployeeModal";

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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editSubmitting, setEditSubmitting] = useState(false);

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

  const filteredEmployees = employees.filter((employee) => {
    const value = search.toLowerCase();

    return (
      employee.name.toLowerCase().includes(value) ||
      employee.email.toLowerCase().includes(value) ||
      employee.phone.includes(value) ||
      employee.role.toLowerCase().includes(value)
    );
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage restaurant employees and their roles
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
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

      {/* Employee Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
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
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsEditModalOpen(true);
                          }}
                          disabled={!employee.isActive}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Edit
                        </button>

                        {employee.isActive && (
                          <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                            Deactivate
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

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={createEmployee}
        submitting={submitting}
      />
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
    </div>
  );
};

export default Employees;
