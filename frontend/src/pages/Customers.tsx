import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
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
        <div className="h-12 bg-muted-foreground/20 rounded w-full"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-muted-foreground/20 rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border-l-4 border-destructive p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-destructive"
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
            <p className="text-sm text-destructive-foreground">
              Error loading customers
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-squadspot-secondary">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between bg-card shadow-md rounded-lg p-6 border border-border">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Customers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your customer relationships
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-squadspot-primary hover:bg-squadspot-primary/90 focus:outline-none"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-card shadow rounded-lg border border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search customers (name, email, company...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-4 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-input text-foreground"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-foreground bg-secondary hover:bg-secondary/80 focus:outline-none"
          >
            <AdjustmentsHorizontalIcon className="mr-2 h-5 w-5" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-card-foreground"
              >
                Status
              </label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as Filters["status"],
                  })
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none sm:text-sm rounded-md bg-input text-foreground"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="payment-status-filter"
                className="block text-sm font-medium text-card-foreground"
              >
                Payment Status
              </label>
              <select
                id="payment-status-filter"
                value={filters.paymentStatus}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    paymentStatus: e.target.value as Filters["paymentStatus"],
                  })
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none sm:text-sm rounded-md bg-input text-foreground"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="price-range-filter"
                className="block text-sm font-medium text-card-foreground"
              >
                Price Range
              </label>
              <select
                id="price-range-filter"
                value={filters.priceRange}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceRange: e.target.value as Filters["priceRange"],
                  })
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none sm:text-sm rounded-md bg-input text-foreground"
              >
                <option value="all">All Prices</option>
                <option value="0-100">$0 - $100</option>
                <option value="101-500">$101 - $500</option>
                <option value="501-1000">$501 - $1000</option>
                <option value="1000+">$1000+</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="date-added-filter"
                className="block text-sm font-medium text-card-foreground"
              >
                Date Added
              </label>
              <select
                id="date-added-filter"
                value={filters.dateAdded}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateAdded: e.target.value as Filters["dateAdded"],
                  })
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none sm:text-sm rounded-md bg-input text-foreground"
              >
                <option value="all">Any Time</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="this-year">This Year</option>
              </select>
            </div>
            <div className="col-span-full flex justify-end">
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-squadspot-primary hover:text-squadspot-primary/90"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer List/Table */}
      <div className="bg-card shadow-lg rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Payment
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Added
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-card-foreground">
                            {customer.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {customer.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">
                        {customer.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.status === "active"
                            ? "bg-squadspot-primary/10 text-squadspot-primary"
                            : "bg-muted/20 text-muted-foreground"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                      ${customer.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.hasPaid
                            ? "bg-squadspot-primary/10 text-squadspot-primary"
                            : "bg-yellow-100 text-yellow-800" // Kept yellow for pending, can be themed
                        }`}
                      >
                        {customer.hasPaid ? "Paid" : "Pending"}
                        {customer.hasPaid && customer.paidDate && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (on{" "}
                            {new Date(customer.paidDate).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 pt-6 pb-4 whitespace-nowrap text-center text-sm font-medium flex items-center justify-center gap-2 h-full">
                      {customer.softwareUrl && (
                        <a
                          href={customer.softwareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-squadspot-primary flex items-center"
                          title="Open Software URL"
                        >
                          <LinkIcon className="h-5 w-5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEditClick(customer)}
                        className="text-squadspot-primary hover:text-squadspot-primary/90 flex items-center"
                      >
                        <PencilIcon className="h-5 w-5" />
                        <span className="sr-only">Edit {customer.name}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    <XMarkIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2">
                      No customers found matching your criteria.
                    </p>
                    <p className="mt-1">
                      Try adjusting your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modals */}
      {isAddModalOpen && (
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
      )}

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
