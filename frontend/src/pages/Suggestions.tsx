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
  MagnifyingGlassIcon,
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
        return <CheckCircleIcon className="h-5 w-5 text-tovuti-primary" />;
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
        return "text-destructive-foreground bg-destructive/20 border-destructive/30";
      case "medium":
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "low":
        return "text-tovuti-primary/80 bg-tovuti-primary/10 border-tovuti-primary/30";
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
      <div className="animate-pulse p-8 space-y-8">
        <div className="h-32 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl"></div>
        <div className="h-20 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-8 bg-gradient-to-r from-destructive/10 to-destructive/5 border-l-4 border-destructive p-6 rounded-xl">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon
              className="h-6 w-6 text-destructive"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm text-destructive-foreground font-medium">
              Error loading suggestions: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-card to-card/80 shadow-xl border border-border/50 sticky top-0 z-10 backdrop-blur-sm rounded-2xl mb-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-card-foreground to-card-foreground/80 bg-clip-text text-transparent">
                User Suggestions & Feedback
              </h1>
              <p className="mt-2 text-muted-foreground">
                Browse, filter, and manage feedback submitted by users.
              </p>
            </div>
          </div>

          {/* Search and Filter Toggle */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-grow max-w-2xl relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search by title, description, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-tovuti-primary rounded-xl shadow-sm sm:text-sm bg-input/80 text-foreground placeholder-muted-foreground backdrop-blur-sm focus:ring-2 focus:ring-tovuti-primary focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center px-6 py-3 border border-tovuti-primary text-sm font-semibold rounded-xl shadow-sm text-foreground bg-tovuti-primary hover:from-tovuti-primary/80 hover:to-tovuti-primary backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-tovuti-primary transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
            >
              <FunnelIcon className="mr-2 h-5 w-5" />
              {showFilters ? "Hide Filters" : "Show Filters"}
              {Object.values(filters).some((v) => v !== "all") &&
                !showFilters && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-tovuti-primary animate-pulse"></span>
                )}
            </button>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gradient-to-br from-card to-card/80 shadow-lg border border-border/50 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Type Filter */}
              <div>
                <label
                  htmlFor="type-filter"
                  className="block text-sm font-semibold text-muted-foreground mb-2"
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
                  className="block w-full pl-3 pr-10 py-3 text-base border-border focus:outline-none focus:ring-2 focus:ring-tovuti-primary sm:text-sm rounded-xl bg-input/80 text-foreground backdrop-blur-sm"
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
                  className="block text-sm font-semibold text-muted-foreground mb-2"
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
                  className="block w-full pl-3 pr-10 py-3 text-base border-border focus:outline-none focus:ring-2 focus:ring-tovuti-primary sm:text-sm rounded-xl bg-input/80 text-foreground backdrop-blur-sm"
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
                  className="block text-sm font-semibold text-muted-foreground mb-2"
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
                  className="block w-full pl-3 pr-10 py-3 text-base border-border focus:outline-none focus:ring-2 focus:ring-tovuti-primary sm:text-sm rounded-xl bg-input/80 text-foreground backdrop-blur-sm"
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
                  className="block text-sm font-semibold text-muted-foreground mb-2"
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
                  className="block w-full pl-3 pr-10 py-3 text-base border-border focus:outline-none focus:ring-2 focus:ring-tovuti-primary sm:text-sm rounded-xl bg-input/80 text-foreground backdrop-blur-sm"
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
                className="text-sm font-semibold text-tovuti-primary hover:text-tovuti-primary/80 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-tovuti-primary/10"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Grid */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pb-8">
        {filteredSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-gradient-to-br from-card to-card/80 shadow-xl rounded-2xl p-8 flex flex-col justify-between border border-border/50 hover:shadow-2xl transition-all duration-300 cursor-pointer backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1"
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-card-foreground line-clamp-2">
                      {suggestion.title}
                    </h3>
                    <div className="ml-3 flex-shrink-0">
                      {getStatusIcon(suggestion.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg font-medium">
                      {suggestion.type.replace("_", " ")}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${getPriorityColor(
                        suggestion.priority
                      )}`}
                    >
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4 mb-4 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium truncate">
                      {suggestion.userName ||
                        suggestion.userEmail ||
                        "Anonymous"}
                    </span>
                    <span className="bg-muted/30 px-2 py-1 rounded-lg">
                      {suggestion.createdAt.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  {suggestion.businessName && (
                    <p className="text-xs text-muted-foreground mt-2 bg-tovuti-primary/10 px-2 py-1 rounded-lg">
                      Business: {suggestion.businessName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl p-12 max-w-md mx-auto">
              <DocumentMagnifyingGlassIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                No suggestions found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
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
          <div className="space-y-8 text-sm">
            <div className="bg-gradient-to-r from-muted/20 to-muted/10 p-6 rounded-xl border border-border/30">
              <h4 className="font-bold text-foreground mb-4 text-lg">
                Details
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="font-semibold text-muted-foreground">Type</dt>
                  <dd className="text-foreground mt-1">
                    {selectedSuggestion.type.replace("_", " ")}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">
                    Priority
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`px-3 py-1.5 rounded-xl inline-block text-xs font-bold border ${getPriorityColor(
                        selectedSuggestion.priority
                      )}`}
                    >
                      {selectedSuggestion.priority}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">
                    Status
                  </dt>
                  <dd className="flex items-center mt-1">
                    {getStatusIcon(selectedSuggestion.status)}
                    <span className="ml-2 text-foreground capitalize">
                      {selectedSuggestion.status.replace(/_/g, " ")}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted-foreground">
                    Submitted
                  </dt>
                  <dd className="text-foreground mt-1">
                    {selectedSuggestion.createdAt.toDate().toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {selectedSuggestion.description && (
              <div>
                <h4 className="font-bold text-foreground mb-3 text-lg">
                  Description
                </h4>
                <div className="bg-gradient-to-r from-muted/10 to-muted/5 p-4 rounded-xl border border-border/30">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedSuggestion.description}
                  </p>
                </div>
              </div>
            )}

            {(selectedSuggestion.userName || selectedSuggestion.userEmail) && (
              <div className="bg-gradient-to-r from-muted/20 to-muted/10 p-6 rounded-xl border border-border/30">
                <h4 className="font-bold text-foreground mb-4 text-lg">
                  User Info
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {selectedSuggestion.userName && (
                    <div>
                      <dt className="font-semibold text-muted-foreground">
                        Name
                      </dt>
                      <dd className="text-foreground mt-1">
                        {selectedSuggestion.userName}
                      </dd>
                    </div>
                  )}
                  {selectedSuggestion.userEmail && (
                    <div>
                      <dt className="font-semibold text-muted-foreground">
                        Email
                      </dt>
                      <dd className="text-foreground mt-1">
                        {selectedSuggestion.userEmail}
                      </dd>
                    </div>
                  )}
                  {selectedSuggestion.userRole && (
                    <div>
                      <dt className="font-semibold text-muted-foreground">
                        Role
                      </dt>
                      <dd className="text-foreground mt-1">
                        {selectedSuggestion.userRole}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {selectedSuggestion.businessName && (
              <div className="bg-gradient-to-r from-tovuti-primary/10 to-tovuti-primary/5 p-6 rounded-xl border border-tovuti-primary/20">
                <h4 className="font-bold text-foreground mb-2 text-lg">
                  Business
                </h4>
                <p className="text-muted-foreground">
                  {selectedSuggestion.businessName} (ID:{" "}
                  {selectedSuggestion.businessId || "N/A"})
                </p>
              </div>
            )}

            {selectedSuggestion.screenshotUrls &&
              selectedSuggestion.screenshotUrls.length > 0 && (
                <div>
                  <h4 className="font-bold text-foreground mb-4 text-lg">
                    Screenshots
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedSuggestion.screenshotUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-border rounded-xl overflow-hidden hover:opacity-80 transition-opacity shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <img
                          src={url || "/placeholder.svg"}
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
                <h4 className="font-bold text-foreground mb-4 text-lg">
                  System Info
                </h4>
                <pre className="text-xs bg-gradient-to-r from-muted/30 to-muted/20 p-4 rounded-xl overflow-x-auto text-muted-foreground border border-border/30 font-mono">
                  {JSON.stringify(selectedSuggestion.systemInfo, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-6 border-t border-border/30">
              <h4 className="font-bold text-foreground mb-4 text-lg">
                Update Status
              </h4>
              <div className="flex flex-wrap gap-3">
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
                      className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105
                      ${
                        selectedSuggestion.status === statusOption.value
                          ? "bg-tovuti-primary text-primary-foreground cursor-not-allowed shadow-lg"
                          : "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-tovuti-primary/80 hover:to-tovuti-primary hover:text-primary-foreground shadow-md hover:shadow-lg"
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
