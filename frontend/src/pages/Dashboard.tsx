import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { auth } from "../lib/firebase";
import { db } from "../lib/firebase";
import {
  UserIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  CheckIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import ProjectList from "../components/ProjectList";

interface DashboardStats {
  total: number;
  active: number;
  newThisMonth: number;
}

interface RecentCustomer {
  id: string;
  name: string;
  company: string;
  status: "active" | "inactive";
  createdAt: Timestamp;
}

interface RecentFeedback {
  id: string;
  title: string;
  type: "feature_request" | "bug_report" | "general_feedback";
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
  businessName?: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    newThisMonth: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedback[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersCollection = collection(db, "customers");

        // Get all customers
        const totalSnapshot = await getDocs(customersCollection);
        const total = totalSnapshot.size;

        // Get active customers
        const activeQuery = query(
          customersCollection,
          where("status", "==", "active")
        );
        const activeSnapshot = await getDocs(activeQuery);
        const active = activeSnapshot.size;

        // Get new customers this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonthQuery = query(
          customersCollection,
          where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
        );
        const newThisMonthSnapshot = await getDocs(newThisMonthQuery);
        const newThisMonth = newThisMonthSnapshot.size;

        // Get recent customers
        const recentQuery = query(
          customersCollection,
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentSnapshot = await getDocs(recentQuery);
        const recentCustomersList = recentSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            company: data.company,
            status: data.status,
            createdAt: data.createdAt,
          };
        }) as RecentCustomer[];

        // Get recent feedback
        const feedbackCollection = collection(db, "feedback");
        const recentFeedbackQuery = query(
          feedbackCollection,
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const recentFeedbackSnapshot = await getDocs(recentFeedbackQuery);
        const recentFeedbackList = recentFeedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RecentFeedback[];

        setRecentFeedback(recentFeedbackList);
        setStats({ total, active, newThisMonth });
        setRecentCustomers(recentCustomersList);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch dashboard data")
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-muted-foreground/20 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-muted-foreground/20 rounded-lg"
            ></div>
          ))}
        </div>
        <div className="h-64 bg-muted-foreground/20 rounded-lg"></div>
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
              Error loading dashboard data
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = auth.currentUser;
  const statsDisplay = [
    {
      name: "Total Customers",
      value: stats.total,
      icon: UsersIcon,
      color: "text-squadspot-primary",
      bgColor: "bg-card",
    },
    {
      name: "Active Customers",
      value: stats.active,
      icon: UserIcon,
      color: "text-squadspot-primary",
      bgColor: "bg-card",
    },
    {
      name: "New This Month",
      value: stats.newThisMonth,
      icon: ArrowTrendingUpIcon,
      color: "text-squadspot-primary",
      bgColor: "bg-card",
    },
  ];

  const getStatusIcon = (status: RecentFeedback["status"]) => {
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

  const getPriorityColor = (priority: RecentFeedback["priority"]) => {
    switch (priority) {
      case "high":
        return "text-destructive-foreground bg-destructive/20";
      case "medium":
        return "text-yellow-700 bg-yellow-100";
      case "low":
        return "text-squadspot-primary/80 bg-squadspot-primary/10";
    }
  };

  const getFeedbackTypeDisplay = (type: RecentFeedback["type"]) => {
    switch (type) {
      case "feature_request":
        return "Feature Request";
      case "bug_report":
        return "Bug Report";
      case "general_feedback":
        return "General Feedback";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {currentUser?.displayName || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Hope you been smashing that shit.
        </p>
      </header>

      {/* Stats Cards */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Customer Statistics
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statsDisplay.map((item) => (
            <div
              key={item.name}
              className={`${item.bgColor} rounded-lg shadow p-6 flex items-start space-x-4`}
            >
              <div className="flex-shrink-0">
                <item.icon
                  className={`h-8 w-8 ${item.color}`}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {item.name}
                </p>
                <p className="text-2xl font-bold text-card-foreground">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Customers */}
        <section
          aria-labelledby="recent-customers-heading"
          className="lg:col-span-2"
        >
          <div className="bg-card shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2
                id="recent-customers-heading"
                className="text-lg font-medium text-card-foreground"
              >
                Recent Customers
              </h2>
            </div>
            <div className="border-t border-border px-6 py-2">
              {recentCustomers.length > 0 ? (
                <ul role="list" className="divide-y divide-border">
                  {recentCustomers.map((customer) => (
                    <li key={customer.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <UserIcon className="h-8 w-8 rounded-full text-squadspot-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground truncate">
                            {customer.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {customer.company}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.status === "active"
                                ? "bg-squadspot-primary/10 text-squadspot-primary"
                                : "bg-muted-foreground/10 text-muted-foreground"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No recent customers found.
                </p>
              )}
            </div>
            <div className="p-4 border-t border-border text-sm">
              <a
                href="/customers"
                className="font-medium text-squadspot-primary hover:text-squadspot-primary/90"
              >
                View all customers
              </a>
            </div>
          </div>
        </section>

        {/* Recent Feedback */}
        <section aria-labelledby="recent-feedback-heading">
          <div className="bg-card shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2
                id="recent-feedback-heading"
                className="text-lg font-medium text-card-foreground"
              >
                Recent Feedback
              </h2>
            </div>
            <div className="border-t border-border px-6 py-2">
              {recentFeedback.length > 0 ? (
                <ul role="list" className="divide-y divide-border">
                  {recentFeedback.map((feedback) => (
                    <li key={feedback.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {feedback.title}
                        </p>
                        {getStatusIcon(feedback.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{feedback.businessName || "N/A"}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            feedback.priority
                          )}`}
                        >
                          {feedback.priority}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getFeedbackTypeDisplay(feedback.type)} - Submitted:{" "}
                        {feedback.createdAt.toDate().toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No recent feedback submitted.
                </p>
              )}
            </div>
            <div className="p-4 border-t border-border text-sm">
              <a
                href="/suggestions"
                className="font-medium text-squadspot-primary hover:text-squadspot-primary/90"
              >
                View all feedback
              </a>
            </div>
          </div>
        </section>
      </div>
      <div className="mt-8">
        {" "}
        {/* Or some other appropriate spacing */}
        <ProjectList />
      </div>
    </div>
  );
}
