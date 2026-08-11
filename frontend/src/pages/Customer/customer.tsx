import { useEffect, useState } from "react";
import api from "../../api/axious";
import AddCustomerModal from "../../components/customers/AddCustomerModal";
import CustomerDetailsModal from "../../components/customers/CustomerDetailsModal";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const getCustomers = async (searchValue?: string) => {
    try {
      const response = await api.get("/customers/active", {
        params: {
          search: searchValue || undefined,
        },
      });

      setCustomers(response.data.data);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);

  const handleSearch = () => {
    getCustomers(search);
  };

  const handleClear = () => {
    setSearch("");
    getCustomers("");
  };

  if (loading) {
    return <div className="p-6">Loading customers...</div>;
  }

  const createCustomer = async (name: string, phone: string) => {
    try {
      setSubmitting(true);

      const response = await api.post("/customers", {
        name,
        phone,
      });

      setCustomers((prevCustomers) => [response.data.data, ...prevCustomers]);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create customer:", error);
    } finally {
      setSubmitting(false);
    }
  };
  const getCustomerOrders = async (customerId: string) => {
    try {
      setLoadingOrders(true);

      const response = await api.get(`/customers/${customerId}/orders`);

      setCustomerOrders(response.data.data);
    } catch (error) {
      console.error("Failed to load customer orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage restaurant customers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="mt-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search by name or phone..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
        />

        <button
          onClick={handleSearch}
          className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Search
        </button>

        {search && (
          <button
            onClick={handleClear}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customer Table */}
      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>

                <th className="px-6 py-4 font-medium">Phone</th>

                <th className="px-6 py-4 font-medium">Status</th>

                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {customer.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {customer.phone}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          getCustomerOrders(customer._id);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createCustomer}
        submitting={submitting}
      />
      <CustomerDetailsModal
        isOpen={selectedCustomer !== null}
        customer={selectedCustomer}
        orders={customerOrders}
        loading={loadingOrders}
        onClose={() => {
          setSelectedCustomer(null);
          setCustomerOrders([]);
        }}
      />
    </div>
  );
};

export default Customers;
