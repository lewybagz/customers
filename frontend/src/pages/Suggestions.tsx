import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/apollo-client";
import {
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  CheckIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import Modal from "../components/Modal";
import { toast } from "react-hot-toast";

interface SystemInfo {
  browser?: {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    language?: string;
    maxTouchPoints?: number;
    name?: string;
    platform?: string;
    userAgent?: string;
    vendor?: string;
    version?: string;
  };
  device?: {
    orientation?: string;
    touch?: boolean;
    type?: string;
  };
  network?: {
    downlink?: number;
    effectiveType?: string;
  };
  os?: {
    language?: string;
    platform?: string;
  };
  screenResolution?: {
    height?: number;
    pixelRatio?: number;
    width?: number;
  };
  timezone?: string;
  userAgent?: string;
}

interface Suggestion {
  id: string;
  businessId?: string;
  businessName?: string;
  type: "feature_request" | "bug_report" | "general_feedback";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status:
    | "pending"
    | "under_review"
    | "under_investigation"
    | "in_progress"
    | "fixed"
    | "wont_fix"
    | "cannot_reproduce"
    | "planned"
    | "in_development"
    | "completed"
    | "declined"
    | "acknowledged"
    | "addressed";
  createdAt: Timestamp;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  screenshotUrls?: string[];
  systemInfo?: SystemInfo;
}

interface Filters {
  type: "all" | "feature_request" | "bug_report" | "general_feedback";
  priority: "all" | "low" | "medium" | "high";
  status:
    | "all"
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "implemented";
  dateRange: "all" | "today" | "this-week" | "this-month";
}

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [filters, setFilters] = useState<Filters>({
    type: "all",
    priority: "all",
    status: "all",
    dateRange: "all",
  });

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const suggestionsRef = collection(db, "feedback");
      const q = query(suggestionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const suggestionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Suggestion[];
      setSuggestions(suggestionsList);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch suggestions")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const getDateRangeFilter = (createdAt: Timestamp) => {
    const date = createdAt.toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "today";
    if (diffDays <= 7) return "this-week";
    if (diffDays <= 30) return "this-month";
    return "older";
  };

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((suggestion) => {
      // Search filter
      const searchFields = [
        suggestion.title,
        suggestion.description,
        suggestion.userName || "",
        suggestion.userEmail || "",
      ].map((field) => field.toLowerCase());

      const searchTerms = searchTerm.toLowerCase().split(" ");
      const matchesSearch = searchTerms.every((term) =>
        searchFields.some((field) => field.includes(term))
      );

      if (!matchesSearch) return false;

      // Type filter
      if (filters.type !== "all" && suggestion.type !== filters.type) {
        return false;
      }

      // Priority filter
      if (
        filters.priority !== "all" &&
        suggestion.priority !== filters.priority
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && suggestion.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (
        filters.dateRange !== "all" &&
        getDateRangeFilter(suggestion.createdAt) !== filters.dateRange
      ) {
        return false;
      }

      return true;
    });
  }, [suggestions, searchTerm, filters]);

  const resetFilters = () => {
    setFilters({
      type: "all",
      priority: "all",
      status: "all",
      dateRange: "all",
    });
  };

  const getStatusIcon = (status: Suggestion["status"]) => {
    switch (status) {
      case "fixed":
      case "completed":
      case "addressed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "wont_fix":
      case "declined":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "planned":
      case "acknowledged":
        return <CheckIcon className="h-5 w-5 text-blue-500" />;
      case "under_review":
      case "under_investigation":
        return (
          <DocumentMagnifyingGlassIcon className="h-5 w-5 text-yellow-500" />
        );
      case "in_progress":
      case "in_development":
        return <ArrowPathIcon className="h-5 w-5 text-indigo-500" />;
      case "cannot_reproduce":
        return <QuestionMarkCircleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Suggestion["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-700 bg-red-100";
      case "medium":
        return "text-yellow-700 bg-yellow-100";
      case "low":
        return "text-green-700 bg-green-100";
    }
  };

  const getStatusOptions = (type: Suggestion["type"]) => {
    switch (type) {
      case "bug_report":
        return [
          { value: "pending", label: "Pending" },
          { value: "under_investigation", label: "Under Investigation" },
          { value: "in_progress", label: "In Progress" },
          { value: "fixed", label: "Fixed" },
          { value: "wont_fix", label: "Won't Fix" },
          { value: "cannot_reproduce", label: "Cannot Reproduce" },
        ];
      case "feature_request":
        return [
          { value: "pending", label: "Pending" },
          { value: "under_review", label: "Under Review" },
          { value: "planned", label: "Planned" },
          { value: "in_development", label: "In Development" },
          { value: "completed", label: "Completed" },
          { value: "declined", label: "Declined" },
        ];
      case "general_feedback":
        return [
          { value: "pending", label: "Pending" },
          { value: "under_review", label: "Under Review" },
          { value: "acknowledged", label: "Acknowledged" },
          { value: "addressed", label: "Addressed" },
          { value: "declined", label: "Declined" },
        ];
      default:
        return [];
    }
  };

  const updateSuggestionStatus = async (
    id: string,
    newStatus: Suggestion["status"]
  ) => {
    try {
      const suggestionRef = doc(db, "feedback", id);
      await updateDoc(suggestionRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      setSuggestions((prevSuggestions) =>
        prevSuggestions.map((suggestion) =>
          suggestion.id === id
            ? { ...suggestion, status: newStatus }
            : suggestion
        )
      );

      // If the suggestion is currently selected, update modal state
      if (selectedSuggestion?.id === id) {
        setSelectedSuggestion((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (error) {
      console.error("Error updating suggestion status:", error);
      toast.error("Failed to update suggestion status");
    }
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
            <XCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error loading suggestions</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Suggestions</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage user suggestions and feedback
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => fetchSuggestions()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-100 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search suggestions
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
                placeholder="Search suggestions..."
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
            <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
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
              {/* Type Filter */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type
                </label>
                <select
                  id="type"
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      type: e.target.value as Filters["type"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="bug_report">Bug Report</option>
                  <option value="general_feedback">General Feedback</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priority: e.target.value as Filters["priority"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

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
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="under_investigation">
                    Under Investigation
                  </option>
                  <option value="in_progress">In Progress</option>
                  <option value="fixed">Fixed</option>
                  <option value="wont_fix">Won't Fix</option>
                  <option value="cannot_reproduce">Cannot Reproduce</option>
                  <option value="planned">Planned</option>
                  <option value="in_development">In Development</option>
                  <option value="completed">Completed</option>
                  <option value="declined">Declined</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="addressed">Addressed</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label
                  htmlFor="dateRange"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date Added
                </label>
                <select
                  id="dateRange"
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: e.target.value as Filters["dateRange"],
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">{filteredSuggestions.length}</span> of{" "}
            <span className="font-medium">{suggestions.length}</span>{" "}
            suggestions
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-500">
              Search results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Suggestions List */}
        <div className="overflow-hidden shadow-sm border border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Business
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Priority
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Submitted
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuggestions.map((suggestion) => (
                <tr
                  key={suggestion.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.title}
                    </div>
                    {suggestion.userEmail && (
                      <div className="text-sm text-gray-500">
                        by {suggestion.userEmail}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {suggestion.businessName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {suggestion.businessId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                      {suggestion.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(
                        suggestion.priority
                      )}`}
                    >
                      {suggestion.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(suggestion.status)}
                      <select
                        value={suggestion.status}
                        onChange={(e) =>
                          updateSuggestionStatus(
                            suggestion.id,
                            e.target.value as Suggestion["status"]
                          )
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        {getStatusOptions(suggestion.type).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {suggestion.createdAt.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedSuggestion(suggestion)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedSuggestion}
        onClose={() => setSelectedSuggestion(null)}
        title="Suggestion Details"
      >
        {selectedSuggestion && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {selectedSuggestion.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Submitted on{" "}
                {selectedSuggestion.createdAt.toDate().toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {(selectedSuggestion.businessName ||
                selectedSuggestion.businessId) && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Business
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedSuggestion.businessName}
                    {selectedSuggestion.businessId &&
                      ` (${selectedSuggestion.businessId})`}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {selectedSuggestion.type.replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Priority</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(
                      selectedSuggestion.priority
                    )}`}
                  >
                    {selectedSuggestion.priority}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 flex items-center space-x-2">
                  {getStatusIcon(selectedSuggestion.status)}
                  <select
                    value={selectedSuggestion.status}
                    onChange={(e) =>
                      updateSuggestionStatus(
                        selectedSuggestion.id,
                        e.target.value as Suggestion["status"]
                      )
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {getStatusOptions(selectedSuggestion.type).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {selectedSuggestion.description}
              </dd>
            </div>

            {selectedSuggestion.screenshotUrls &&
              selectedSuggestion.screenshotUrls.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Screenshots
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {selectedSuggestion.screenshotUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={url}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-auto rounded-lg shadow-sm"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-500">
                User Information
              </h4>
              <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedSuggestion.userEmail}
                  </dd>
                </div>
                {selectedSuggestion.userName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedSuggestion.userName}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedSuggestion.userRole}
                  </dd>
                </div>
              </dl>
            </div>

            {/* System Information Section - Only show if systemInfo exists */}
            {selectedSuggestion.systemInfo && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-500">
                  System Information
                </h4>

                {/* Browser Information */}
                {selectedSuggestion.systemInfo.browser && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700">
                      Browser
                    </h5>
                    <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {(selectedSuggestion.systemInfo.browser.name ||
                        selectedSuggestion.systemInfo.browser.version) && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Name & Version
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedSuggestion.systemInfo.browser.name ||
                              "Unknown"}
                            {selectedSuggestion.systemInfo.browser.version &&
                              ` ${selectedSuggestion.systemInfo.browser.version}`}
                          </dd>
                        </div>
                      )}
                      {selectedSuggestion.systemInfo.browser.language && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Language
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedSuggestion.systemInfo.browser.language}
                          </dd>
                        </div>
                      )}
                      {(selectedSuggestion.systemInfo.browser.deviceMemory ||
                        selectedSuggestion.systemInfo.browser
                          .hardwareConcurrency) && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Memory
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedSuggestion.systemInfo.browser
                              .deviceMemory &&
                              `${selectedSuggestion.systemInfo.browser.deviceMemory}GB RAM`}
                            {selectedSuggestion.systemInfo.browser
                              .hardwareConcurrency &&
                              ` ${selectedSuggestion.systemInfo.browser.hardwareConcurrency} Cores`}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Device Information */}
                {selectedSuggestion.systemInfo.device && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700">
                      Device
                    </h5>
                    <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {selectedSuggestion.systemInfo.device.type && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Type
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 capitalize">
                            {selectedSuggestion.systemInfo.device.type}
                          </dd>
                        </div>
                      )}
                      {selectedSuggestion.systemInfo.device.orientation && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Orientation
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedSuggestion.systemInfo.device.orientation}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Touch Support
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {selectedSuggestion.systemInfo.device.touch
                            ? "Yes"
                            : "No"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}

                {/* Network Information */}
                {selectedSuggestion.systemInfo.network && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700">
                      Network
                    </h5>
                    <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {selectedSuggestion.systemInfo.network.effectiveType && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Connection Type
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 uppercase">
                            {
                              selectedSuggestion.systemInfo.network
                                .effectiveType
                            }
                          </dd>
                        </div>
                      )}
                      {selectedSuggestion.systemInfo.network.downlink && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Downlink Speed
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedSuggestion.systemInfo.network.downlink}{" "}
                            Mbps
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Screen Resolution */}
                {selectedSuggestion.systemInfo.screenResolution && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700">
                      Display
                    </h5>
                    <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {selectedSuggestion.systemInfo.screenResolution.width &&
                        selectedSuggestion.systemInfo.screenResolution
                          .height && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              Resolution
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {
                                selectedSuggestion.systemInfo.screenResolution
                                  .width
                              }{" "}
                              x{" "}
                              {
                                selectedSuggestion.systemInfo.screenResolution
                                  .height
                              }
                            </dd>
                          </div>
                        )}
                      {selectedSuggestion.systemInfo.screenResolution
                        .pixelRatio && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Pixel Ratio
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {
                              selectedSuggestion.systemInfo.screenResolution
                                .pixelRatio
                            }
                            x
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Additional Information */}
                {(selectedSuggestion.systemInfo.timezone ||
                  selectedSuggestion.systemInfo.os?.platform) && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700">
                      Additional Info
                    </h5>
                    <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {selectedSuggestion.systemInfo.timezone && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Timezone
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedSuggestion.systemInfo.timezone}
                          </dd>
                        </div>
                      )}
                      {selectedSuggestion.systemInfo.os?.platform && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Platform
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {selectedSuggestion.systemInfo.os.platform}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
