import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/apollo-client";
import {
  PlusIcon,
  PencilIcon,
  LinkIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Modal from "../components/Modal";
import CustomerForm from "../components/CustomerForm";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive";
  price: number;
  hasPaid: boolean;
  paidDate: string | null;
  createdAt: string;
  softwareUrl?: string;
  notes?: string;
}

type CustomerFormData = Omit<Customer, "id" | "createdAt" | "paidDate"> & {
  paidDate: Date | null;
};

interface Filters {
  status: "all" | "active" | "inactive";
  paymentStatus: "all" | "paid" | "pending";
  priceRange: "all" | "0-100" | "101-500" | "501-1000" | "1000+";
  dateAdded: "all" | "today" | "this-week" | "this-month" | "this-year";
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<
    (CustomerFormData & { id: string }) | null
  >(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    paymentStatus: "all",
    priceRange: "all",
    dateAdded: "all",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const customersRef = collection(db, "customers");
      const q = query(customersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const customersList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          paidDate:
            data.paidDate instanceof Timestamp
              ? data.paidDate.toDate().toISOString()
              : data.paidDate,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt,
        };
      }) as Customer[];
      setCustomers(customersList);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch customers")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEditClick = (customer: Customer) => {
    try {
      let paidDate: Date | null = null;
      if (customer.paidDate) {
        const date = new Date(customer.paidDate);
        if (!isNaN(date.getTime())) {
          paidDate = date;
        }
      }

      setEditingCustomer({
        ...customer,
        paidDate,
      });
    } catch (err) {
      console.error("Error processing date:", err);
      setEditingCustomer({
        ...customer,
        paidDate: null,
      });
    }
  };

  const getPriceRangeFilter = (price: number) => {
    if (price <= 100) return "0-100";
    if (price <= 500) return "101-500";
    if (price <= 1000) return "501-1000";
    return "1000+";
  };

  const getDateAddedFilter = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "today";
    if (diffDays <= 7) return "this-week";
    if (diffDays <= 30) return "this-month";
    if (diffDays <= 365) return "this-year";
    return "older";
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter
      const searchFields = [
        customer.name,
        customer.email,
        customer.phone,
        customer.company,
        customer.notes || "",
      ].map((field) => field.toLowerCase());

      const searchTerms = searchTerm.toLowerCase().split(" ");
      const matchesSearch = searchTerms.every((term) =>
        searchFields.some((field) => field.includes(term))
      );

      if (!matchesSearch) return false;

      // Status filter
      if (filters.status !== "all" && customer.status !== filters.status) {
        return false;
      }

      // Payment status filter
      if (filters.paymentStatus !== "all") {
        if (
          (filters.paymentStatus === "paid" && !customer.hasPaid) ||
          (filters.paymentStatus === "pending" && customer.hasPaid)
        ) {
          return false;
        }
      }

      // Price range filter
      if (
        filters.priceRange !== "all" &&
        getPriceRangeFilter(customer.price) !== filters.priceRange
      ) {
        return false;
      }

      // Date added filter
      if (
        filters.dateAdded !== "all" &&
        getDateAddedFilter(customer.createdAt) !== filters.dateAdded
      ) {
        return false;
      }

      return true;
    });
  }, [customers, searchTerm, filters]);

  const resetFilters = () => {
    setFilters({
      status: "all",
      paymentStatus: "all",
      priceRange: "all",
      dateAdded: "all",
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded w-full"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error loading customers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customer relationships
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-100 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search customers
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-150"
                placeholder="Search by name, email, phone, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-400" />
            Filters
            {Object.values(filters).some((value) => value !== "all") && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Filters</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Reset filters
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value as Filters["status"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label
                  htmlFor="paymentStatus"
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment Status
                </label>
                <select
                  id="paymentStatus"
                  value={filters.paymentStatus}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      paymentStatus: e.target.value as Filters["paymentStatus"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label
                  htmlFor="priceRange"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price Range
                </label>
                <select
                  id="priceRange"
                  value={filters.priceRange}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priceRange: e.target.value as Filters["priceRange"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">All</option>
                  <option value="0-100">$0 - $100</option>
                  <option value="101-500">$101 - $500</option>
                  <option value="501-1000">$501 - $1000</option>
                  <option value="1000+">$1000+</option>
                </select>
              </div>

              {/* Date Added Filter */}
              <div>
                <label
                  htmlFor="dateAdded"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date Added
                </label>
                <select
                  id="dateAdded"
                  value={filters.dateAdded}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateAdded: e.target.value as Filters["dateAdded"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="this-week">This week</option>
                  <option value="this-month">This month</option>
                  <option value="this-year">This year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">{filteredCustomers.length}</span> of{" "}
            <span className="font-medium">{customers.length}</span> customers
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-500">
              Search results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Table */}
        <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-[0_4px_40px_-2px_rgba(0,0,0,0.3)] rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Company
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Payment Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Software
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50/90 transition-all duration-150 ease-in-out group"
                    >
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-150">
                            <span className="text-gray-600 font-medium text-lg">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-gray-500">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        {customer.company}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-900">
                        ${customer.price.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm">
                        {customer.hasPaid ? (
                          <div>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Paid
                            </span>
                            {customer.paidDate && (
                              <span className="ml-2 text-gray-500">
                                {new Date(
                                  customer.paidDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            customer.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {customer.status.charAt(0).toUpperCase() +
                            customer.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        {customer.softwareUrl ? (
                          <a
                            href={customer.softwareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEditClick(customer)}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center transition-colors duration-150"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
      >
        <CustomerForm
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchCustomers();
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        title="Edit Customer"
      >
        {editingCustomer && (
          <CustomerForm
            initialData={editingCustomer}
            isEditing={true}
            onSuccess={() => {
              setEditingCustomer(null);
              fetchCustomers();
            }}
            onCancel={() => setEditingCustomer(null)}
          />
        )}
      </Modal>
    </div>
  );
}
