import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/apollo-client";

const testCustomers = [
  {
    name: "John Smith",
    email: "john.smith@techcorp.com",
    phone: "(555) 123-4567",
    company: "Tech Corp",
    status: "active",
    price: 1499.99,
    hasPaid: true,
    paidDate: new Date("2024-02-15"),
    softwareUrl: "https://app.techcorp.com/dashboard",
    notes: "Enterprise customer - Priority support",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Sarah Johnson",
    email: "sarah@innovatesolutions.com",
    phone: "(555) 234-5678",
    company: "Innovate Solutions",
    status: "active",
    price: 999.99,
    hasPaid: false,
    paidDate: null,
    softwareUrl: "https://portal.innovatesolutions.com",
    notes: "New customer - Implementation in progress",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Michael Chen",
    email: "mchen@globaltech.com",
    phone: "(555) 345-6789",
    company: "Global Tech Industries",
    status: "active",
    price: 2499.99,
    hasPaid: true,
    paidDate: new Date("2024-01-20"),
    softwareUrl: "https://globaltech.app/dashboard",
    notes: "Multiple licenses - Custom integration",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Emma Wilson",
    email: "emma@startupinc.co",
    phone: "(555) 456-7890",
    company: "Startup Inc",
    status: "inactive",
    price: 499.99,
    hasPaid: true,
    paidDate: new Date("2023-12-01"),
    softwareUrl: "",
    notes: "Subscription paused - Will review in Q2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "David Martinez",
    email: "david@quickserve.net",
    phone: "(555) 567-8901",
    company: "QuickServe Solutions",
    status: "active",
    price: 799.99,
    hasPaid: true,
    paidDate: new Date("2024-02-01"),
    softwareUrl: "https://qs-portal.net/app",
    notes: "Small business package",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Lisa Thompson",
    email: "lisa@growthmarketing.com",
    phone: "(555) 678-9012",
    company: "Growth Marketing Co",
    status: "active",
    price: 1299.99,
    hasPaid: false,
    paidDate: null,
    softwareUrl: "https://growth.marketing/portal",
    notes: "Marketing agency - Multiple client accounts",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Robert Kim",
    email: "rkim@securedata.org",
    phone: "(555) 789-0123",
    company: "SecureData Systems",
    status: "inactive",
    price: 1999.99,
    hasPaid: false,
    paidDate: null,
    softwareUrl: "",
    notes: "Contract under review",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function seedCustomers() {
  try {
    const customersRef = collection(db, "customers");
    const results = await Promise.all(
      testCustomers.map((customer) => addDoc(customersRef, customer))
    );
    console.log(`Successfully added ${results.length} test customers`);
    return results;
  } catch (error) {
    console.error("Error seeding customers:", error);
    throw error;
  }
} 