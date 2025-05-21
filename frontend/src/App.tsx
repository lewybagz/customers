import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import PrivateRoute from "./components/PrivateRoute";
import { auth } from "./lib/firebase";
import Suggestions from "./pages/Suggestions";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 w-full">
        <Toaster position="top-right" richColors />
        <div className="max-w-[2000px] mx-auto w-full">
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/suggestions" element={<Suggestions />} />
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Catch all - redirect to dashboard if logged in, otherwise to login */}
            <Route
              path="*"
              element={
                auth.currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
