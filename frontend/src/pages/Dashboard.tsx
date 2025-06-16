import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  doc,
  getDoc,
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
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserName(userDocSnap.data().name);
          } else {
            setUserName(user.displayName || "User");
          }
        }

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
      <div className="animate-pulse space-y-8">
        <div className="h-32 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl"></div>
          <div className="h-80 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl"></div>
        </div>
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
              Error loading dashboard data
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statsDisplay = [
    {
      name: "Total Customers",
      value: stats.total,
      icon: UsersIcon,
      color: "text-tovuti-primary",
      bgColor: "bg-white/80",
      iconBg: "bg-tovuti-primary",
    },
    {
      name: "Active Customers",
      value: stats.active,
      icon: UserIcon,
      color: "text-tovuti-primary",
      bgColor: "bg-white/80",
      iconBg: "bg-tovuti-primary",
    },
    {
      name: "New This Month",
      value: stats.newThisMonth,
      icon: ArrowTrendingUpIcon,
      color: "text-tovuti-primary",
      bgColor: "bg-white/80",
      iconBg: "bg-tovuti-primary",
    },
  ];

  const getStatusIcon = (status: RecentFeedback["status"]) => {
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

  const getPriorityColor = (priority: RecentFeedback["priority"]) => {
    switch (priority) {
      case "high":
        return "text-destructive-foreground bg-destructive/80 border-destructive/90";
      case "medium":
        return "text-yellow-800 bg-yellow-400/80 border-yellow-400/90";
      case "low":
        return "text-tovuti-primary bg-tovuti-primary/20 border-tovuti-primary/30";
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
      <header className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-tovuti-primary to-tovuti-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {(userName || "User").split(" ")[0]}!
            </h1>
            <p className="text-gray-600 mt-1 text-lg">
              Hope you been smashing that shit.
            </p>
          </div>
        </div>
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
              className={`${item.bgColor} rounded-2xl shadow-lg p-8 flex items-start space-x-6 border border-border/30 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex-shrink-0">
                <div className={`${item.iconBg} p-3 rounded-xl shadow-lg`}>
                  <item.icon
                    className="h-8 w-8 text-white"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {item.name}
                </p>
                <p className={`text-3xl font-bold ${item.color} mt-1`}>
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
          <div className="bg-white/80 shadow-xl rounded-2xl overflow-hidden border border-border/50 backdrop-blur-sm">
            <div className="p-8 border-b border-gray-200">
              <h2
                id="recent-customers-heading"
                className="text-xl font-bold text-tovuti-primary"
              >
                Recent Customers
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Latest customer additions to your database
              </p>
            </div>
            <div className="px-8 py-4">
              {recentCustomers.length > 0 ? (
                <ul role="list" className="divide-y divide-gray-200">
                  {recentCustomers.map((customer) => (
                    <li key={customer.id} className="py-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-tovuti-primary to-tovuti-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                            <UserIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {customer.company}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                              customer.status === "active"
                                ? "bg-tovuti-primary/10 text-tovuti-primary border-tovuti-primary/30"
                                : "bg-muted/20 text-muted-foreground border-muted/30"
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
                <div className="text-center py-12">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">
                    No recent customers found.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50/50">
              <a
                href="/customers"
                className="font-semibold text-tovuti-primary hover:text-tovuti-primary/80 transition-colors duration-200 flex items-center group"
              >
                View all customers
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Recent Feedback */}
        <section aria-labelledby="recent-feedback-heading">
          <div className="bg-white/80 shadow-xl rounded-2xl overflow-hidden border border-border/50 backdrop-blur-sm">
            <div className="p-8 border-b border-gray-200">
              <h2
                id="recent-feedback-heading"
                className="text-xl font-bold text-tovuti-primary"
              >
                Recent Feedback
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Latest user submissions
              </p>
            </div>
            <div className="px-8 py-4">
              {recentFeedback.length > 0 ? (
                <ul role="list" className="divide-y divide-gray-200">
                  {recentFeedback.map((feedback) => (
                    <li key={feedback.id} className="py-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate pr-4">
                          {feedback.title}
                        </p>
                        {getStatusIcon(feedback.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="truncate">
                          {feedback.businessName || "N/A"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(
                            feedback.priority
                          )}`}
                        >
                          {feedback.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-lg">
                          {getFeedbackTypeDisplay(feedback.type)}
                        </span>
                        <span>
                          {feedback.createdAt.toDate().toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">
                    No recent feedback submitted.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50/50">
              <a
                href="/suggestions"
                className="font-semibold text-tovuti-primary hover:text-tovuti-primary/80 transition-colors duration-200 flex items-center group"
              >
                View all feedback
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12">
        <ProjectList />
      </div>
    </div>
  );
}
