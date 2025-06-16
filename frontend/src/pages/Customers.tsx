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
  MagnifyingGlassIcon,
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
      <div className="animate-pulse space-y-8">
        <div className="h-32 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl"></div>
        <div className="h-20 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl"></div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border-l-4 border-destructive p-6 rounded-xl">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-destructive"
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
            <p className="text-sm text-destructive-foreground font-medium">
              Error loading customers
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between bg-gradient-to-br from-card to-card/80 shadow-xl rounded-2xl p-8 border border-border/50 backdrop-blur-sm">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-card-foreground to-card-foreground/80 bg-clip-text text-transparent">
            Customers
          </h2>
          <p className="mt-2 text-muted-foreground">
            Manage your customer relationships and track their status
          </p>
        </div>
        <div className="mt-6 sm:mt-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-primary-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/90 hover:from-tovuti-primary/90 hover:to-tovuti-primary focus:outline-none focus:ring-2 focus:ring-tovuti-primary focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 bg-gradient-to-br from-card to-card/80 shadow-lg rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search customers (name, email, company...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-tovuti-primary rounded-xl shadow-sm sm:text-sm bg-input/80 text-foreground placeholder-muted-foreground backdrop-blur-sm focus:ring-2 focus:ring-tovuti-primary focus:border-transparent transition-all duration-200"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-6 py-3 border border-tovuti-primary text-sm font-semibold rounded-xl shadow-sm text-foreground bg-tovuti-primary hover:from-tovuti-primary/80 hover:to-tovuti-primary backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-tovuti-primary transition-all duration-200 transform hover:scale-105"
          >
            <AdjustmentsHorizontalIcon className="mr-2 h-5 w-5" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {Object.values(filters).some((v) => v !== "all") && (
              <span className="ml-2 h-2 w-2 rounded-full bg-tovuti-primary animate-pulse"></span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-8 p-6 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-border/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-semibold text-card-foreground mb-2"
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
                  className="block w-full pl-3 pr-10 py-3 text-base border-border focus:outline-none focus:ring-2 focus:ring-tovuti-primary sm:text-sm rounded-xl bg-input/80 text-foreground backdrop-blur-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="payment-status-filter"
                  className="block text-sm font-semibold text-card-foreground mb-2"
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
                  className="block w-full pl-3 pr-10 py-3 text-base border-border focus:outline-none focus:ring-2 focus:ring-tovuti-primary sm:text-sm rounded-xl bg-input/80 text-foreground backdrop-blur-sm"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="price-range-filter"
                  className="block text-sm font-semibold text-card-foreground mb-2"
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
                  className="block w-full pl-3 pr-10 py-3 text-base border-border focus:outline-none focus:ring-2 focus:ring-tovuti-primary sm:text-sm rounded-xl bg-input/80 text-foreground backdrop-blur-sm"
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
                  className="block text-sm font-semibold text-card-foreground mb-2"
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
                  className="block w-full pl-3 pr-10 py-3 text-base border-border focus:outline-none focus:ring-2 focus:ring-tovuti-primary sm:text-sm rounded-xl bg-input/80 text-foreground backdrop-blur-sm"
                >
                  <option value="all">Any Time</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="this-year">This Year</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-sm font-semibold text-tovuti-primary hover:text-tovuti-primary/80 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-tovuti-primary/10"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer List/Table */}
      <div className="bg-gradient-to-br from-card to-card/80 shadow-xl rounded-2xl overflow-hidden border border-border/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/30 border border-border/30">
            <thead className="bg-gradient-to-r from-muted/50 to-muted/30">
              <tr className="divide-x divide-border/30">
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Payment
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Added
                </th>
                <th scope="col" className="relative px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gradient-to-br from-card to-card/50">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={`hover:bg-muted/20 transition-colors duration-200 divide-x divide-border/30 ${
                      index % 2 === 0 ? "bg-card/50" : "bg-card/30"
                    }`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-tovuti-primary to-tovuti-primary/80 rounded-xl flex items-center justify-center shadow-lg mr-4">
                          <span className="text-white font-semibold text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-card-foreground">
                            {customer.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {customer.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-card-foreground">
                        {customer.company}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-xl border ${
                          customer.status === "active"
                            ? "bg-tovuti-primary/10 text-tovuti-primary border-tovuti-primary/30"
                            : "bg-muted/20 text-muted-foreground border-muted/30"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-card-foreground">
                      ${customer.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-xl border w-fit ${
                            customer.hasPaid
                              ? "bg-tovuti-primary/10 text-tovuti-primary border-tovuti-primary/30"
                              : "bg-yellow-100 text-yellow-800 border-yellow-300"
                          }`}
                        >
                          {customer.hasPaid ? "Paid" : "Pending"}
                        </span>
                        {customer.hasPaid && customer.paidDate && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(customer.paidDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-3">
                        {customer.softwareUrl && (
                          <a
                            href={customer.softwareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-tovuti-primary transition-colors duration-200 p-2 rounded-lg hover:bg-tovuti-primary/10"
                            title="Open Software URL"
                          >
                            <LinkIcon className="h-5 w-5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEditClick(customer)}
                          className="text-tovuti-primary hover:text-tovuti-primary/80 transition-colors duration-200 p-2 rounded-lg hover:bg-tovuti-primary/10"
                        >
                          <PencilIcon className="h-5 w-5" />
                          <span className="sr-only">Edit {customer.name}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <XMarkIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-semibold text-muted-foreground mb-2">
                        No customers found matching your criteria.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters.
                      </p>
                    </div>
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
