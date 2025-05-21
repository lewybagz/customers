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
import { db } from "../lib/firebase";
import {
  FunnelIcon,
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
        return <CheckCircleIcon className="h-5 w-5 text-squadspot-primary" />;
      case "wont_fix":
      case "declined":
        return <XCircleIcon className="h-5 w-5 text-destructive" />;
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
        return <ClockIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: Suggestion["priority"]) => {
    switch (priority) {
      case "high":
        return "text-destructive-foreground bg-destructive/20";
      case "medium":
        return "text-yellow-700 bg-yellow-100";
      case "low":
        return "text-squadspot-primary/80 bg-squadspot-primary/10";
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
      <div className="animate-pulse p-6 space-y-4">
        <div className="h-10 bg-muted-foreground/20 rounded w-1/3"></div>
        <div className="h-8 bg-muted-foreground/20 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-muted-foreground/20 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-6 bg-destructive/10 border-l-4 border-destructive p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon
              className="h-5 w-5 text-destructive"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm text-destructive-foreground">
              Error loading suggestions: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-transparent shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                User Suggestions & Feedback
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse, filter, and manage feedback submitted by users.
              </p>
            </div>
          </div>

          {/* Search and Filter Toggle */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-grow max-w-xl">
              <input
                type="text"
                placeholder="Search by title, description, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-4 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-input text-foreground"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-foreground bg-secondary hover:bg-secondary/80 focus:outline-none whitespace-nowrap"
            >
              <FunnelIcon className="mr-2 h-5 w-5" />
              {showFilters ? "Hide Filters" : "Show Filters"}
              {Object.values(filters).some((v) => v !== "all") &&
                !showFilters && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-squadspot-primary"></span>
                )}
            </button>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card shadow-md border-b border-border p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
              {/* Type Filter */}
              <div>
                <label
                  htmlFor="type-filter"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Type
                </label>
                <select
                  id="type-filter"
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      type: e.target.value as Filters["type"],
                    })
                  }
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none sm:text-sm rounded-md bg-input text-foreground"
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
                  htmlFor="priority-filter"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Priority
                </label>
                <select
                  id="priority-filter"
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priority: e.target.value as Filters["priority"],
                    })
                  }
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none sm:text-sm rounded-md bg-input text-foreground"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              {/* Status Filter */}
              <div>
                <label
                  htmlFor="status-filter-suggestions"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Status
                </label>
                <select
                  id="status-filter-suggestions"
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
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="fixed">Fixed</option>
                  <option value="wont_fix">Won't Fix</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              {/* Date Range Filter */}
              <div>
                <label
                  htmlFor="date-range-filter"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Date Range
                </label>
                <select
                  id="date-range-filter"
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: e.target.value as Filters["dateRange"],
                    })
                  }
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none sm:text-sm rounded-md bg-input text-foreground"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-squadspot-primary hover:text-squadspot-primary/90"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-card shadow-lg rounded-lg p-6 flex flex-col justify-between border border-border hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {suggestion.title}
                    </h3>
                    {getStatusIcon(suggestion.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Type: {suggestion.type.replace("_", " ")}
                  </p>
                  <p
                    className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-3 ${getPriorityColor(
                      suggestion.priority
                    )}`}
                  >
                    Priority: {suggestion.priority}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {suggestion.description}
                  </p>
                </div>
                <div className="mt-auto pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {suggestion.userName ||
                        suggestion.userEmail ||
                        "Anonymous"}
                    </span>
                    <span>
                      {suggestion.createdAt.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  {suggestion.businessName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Business: {suggestion.businessName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">
              No suggestions found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </main>

      {/* Suggestion Detail Modal */}
      {selectedSuggestion && (
        <Modal
          isOpen={!!selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          title={`Suggestion: ${selectedSuggestion.title}`}
        >
          <div className="space-y-6 text-sm">
            <div className="bg-muted/20 p-4 rounded-md">
              <h4 className="font-semibold text-foreground mb-2">Details</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <dt className="font-medium text-muted-foreground">Type</dt>
                  <dd className="text-foreground">
                    {selectedSuggestion.type.replace("_", " ")}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Priority
                  </dt>
                  <dd
                    className={`px-2 py-0.5 rounded-full inline-block text-xs font-medium ${getPriorityColor(
                      selectedSuggestion.priority
                    )}`}
                  >
                    {selectedSuggestion.priority}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Status</dt>
                  <dd className="flex items-center">
                    {getStatusIcon(selectedSuggestion.status)}
                    <span className="ml-2 text-foreground capitalize">
                      {selectedSuggestion.status.replace(/_/g, " ")}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Submitted
                  </dt>
                  <dd className="text-foreground">
                    {selectedSuggestion.createdAt.toDate().toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {selectedSuggestion.description && (
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Description
                </h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedSuggestion.description}
                </p>
              </div>
            )}

            {(selectedSuggestion.userName || selectedSuggestion.userEmail) && (
              <div className="bg-muted/20 p-4 rounded-md">
                <h4 className="font-semibold text-foreground mb-2">
                  User Info
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {selectedSuggestion.userName && (
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Name
                      </dt>
                      <dd className="text-foreground">
                        {selectedSuggestion.userName}
                      </dd>
                    </div>
                  )}
                  {selectedSuggestion.userEmail && (
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Email
                      </dt>
                      <dd className="text-foreground">
                        {selectedSuggestion.userEmail}
                      </dd>
                    </div>
                  )}
                  {selectedSuggestion.userRole && (
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Role
                      </dt>
                      <dd className="text-foreground">
                        {selectedSuggestion.userRole}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {selectedSuggestion.businessName && (
              <div className="bg-muted/20 p-4 rounded-md">
                <h4 className="font-semibold text-foreground mb-1">Business</h4>
                <p className="text-muted-foreground">
                  {selectedSuggestion.businessName} (ID:{" "}
                  {selectedSuggestion.businessId || "N/A"})
                </p>
              </div>
            )}

            {selectedSuggestion.screenshotUrls &&
              selectedSuggestion.screenshotUrls.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Screenshots
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedSuggestion.screenshotUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-border rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={url}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-auto object-cover aspect-video"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {selectedSuggestion.systemInfo && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  System Info
                </h4>
                <pre className="text-xs bg-muted/30 p-3 rounded-md overflow-x-auto text-muted-foreground">
                  {JSON.stringify(selectedSuggestion.systemInfo, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="font-semibold text-foreground mb-2">
                Update Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {getStatusOptions(selectedSuggestion.type).map(
                  (statusOption) => (
                    <button
                      key={statusOption.value}
                      onClick={() =>
                        updateSuggestionStatus(
                          selectedSuggestion.id,
                          statusOption.value as Suggestion["status"]
                        )
                      }
                      disabled={
                        selectedSuggestion.status === statusOption.value
                      }
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                      ${
                        selectedSuggestion.status === statusOption.value
                          ? "bg-squadspot-primary text-primary-foreground cursor-not-allowed"
                          : "bg-secondary text-secondary-foreground hover:bg-squadspot-primary/80 hover:text-primary-foreground"
                      }`}
                    >
                      {statusOption.label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
