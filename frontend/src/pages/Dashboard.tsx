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
import { db } from "../lib/apollo-client";
import {
  UserIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

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

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    newThisMonth: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);

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
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
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
            <p className="text-sm text-red-700">Error loading dashboard data</p>
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
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Active Customers",
      value: stats.active,
      icon: UserIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "New This Month",
      value: stats.newThisMonth,
      icon: ArrowTrendingUpIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {currentUser?.displayName || "User"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your customers today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsDisplay.map((stat) => (
          <div
            key={stat.name}
            className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100"
          >
            <div className="flex items-center">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Customers */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
            <svg
              className="h-5 w-5 text-gray-400 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Recent Customers
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            A list of the 5 most recently added customers
          </p>
        </div>
        <ul role="list" className="divide-y divide-gray-200">
          {recentCustomers.length === 0 ? (
            <li className="px-6 py-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="mt-4 text-sm text-gray-500">
                No customers added yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Add your first customer to get started
              </p>
            </li>
          ) : (
            recentCustomers.map((customer) => (
              <li
                key={customer.id}
                className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
              >
                <div className="px-6 py-5 flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-medium text-lg shadow-sm">
                      {customer.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {customer.name}
                      </p>
                      <div className="ml-2 flex-shrink-0">
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
                      </div>
                    </div>
                    <div className="mt-1 flex items-center">
                      <p className="text-sm text-gray-500 truncate">
                        {customer.company}
                      </p>
                      <span className="mx-1.5 text-gray-300">·</span>
                      <p className="text-sm text-gray-500 truncate">
                        Added{" "}
                        {customer.createdAt
                          ?.toDate()
                          .toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => (window.location.href = "/customers")}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
