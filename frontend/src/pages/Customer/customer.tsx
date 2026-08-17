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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const getCustomers = async (
    searchValue: string = search,
    currentPage: number = page,
  ) => {
    try {
      setLoading(true);

      const response = await api.get("/customers/active", {
        params: {
          search: searchValue.trim() || undefined,
          page: currentPage,
          limit: 10,
        },
      });

      setCustomers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCustomers("", 1);
  }, []);

  const handleSearch = () => {
    setPage(1);
    getCustomers(search, 1);
  };

  const handleClear = () => {
    setSearch("");
    setPage(1);
    getCustomers("", 1);
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    setPage(newPage);
    getCustomers(search, newPage);
  };

  const createCustomer = async (name: string, phone: string) => {
    try {
      setSubmitting(true);

      await api.post("/customers", {
        name,
        phone,
      });

      // Refresh current page
      await getCustomers(search, page);

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

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-sm text-gray-500">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage restaurant customers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
        >
          + Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
          className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
        />

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            className="flex-1 rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 sm:flex-none"
          >
            Search
          </button>

          {search && (
            <button
              onClick={handleClear}
              className="flex-1 rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Customer Table */}
      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-4 font-medium sm:px-6">Name</th>

                <th className="px-4 py-4 font-medium sm:px-6">Phone</th>

                <th className="px-4 py-4 font-medium sm:px-6">Status</th>

                <th className="px-4 py-4 font-medium sm:px-6">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900 sm:px-6">
                      {customer.name}
                    </td>

                    <td className="px-4 py-4 text-gray-600 sm:px-6">
                      {customer.phone}
                    </td>

                    <td className="px-4 py-4 sm:px-6">
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    </td>

                    <td className="px-4 py-4 sm:px-6">
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-gray-500">
              Page {pagination.currentPage} of{" "}
              {pagination.totalPages} ({pagination.totalItems} customers)
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white">
                {page}
              </span>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createCustomer}
        submitting={submitting}
      />

      {/* Customer Details Modal */}
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