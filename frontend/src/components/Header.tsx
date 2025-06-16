import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const navLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Customers", path: "/customers" },
  { name: "Suggestions", path: "/suggestions" },
  { name: "Admin", path: "/admin" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const getLinkClass = (path: string) =>
    location.pathname === path
      ? "border-tovuti-primary text-tovuti-primary bg-tovuti-primary/10 shadow-sm"
      : "border-transparent text-muted-foreground hover:border-tovuti-primary hover:text-tovuti-primary hover:bg-tovuti-primary/5 transition-all duration-200";

  return (
    <header className="bg-gradient-to-r from-secondary via-secondary to-secondary/95 text-secondary-foreground shadow-xl sticky top-0 py-3 z-30 backdrop-blur-sm border-b border-tovuti-primary/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center">
          {/* Logo/Brand */}
          <Link to="/dashboard" className="flex items-center flex-shrink-0">
            <img
              className="h-10 w-auto"
              src="/images/logo-no-text.png"
              alt="ClientSync logo"
            />
            <span className="ml-3 text-2xl font-bold tracking-tight text-tovuti-primary font-aldrich select-none">
              ClientSync
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center px-4 py-3 rounded-xl border-b-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-tovuti-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transform hover:scale-105 transition-all duration-200 ${getLinkClass(
                  link.path
                )}`}
                tabIndex={0}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Sign out button (desktop) */}
          <div className="hidden md:flex md:items-center">
            <button
              onClick={handleLogout}
              className="ml-6 inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-primary-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/90 hover:from-tovuti-primary/90 hover:to-tovuti-primary shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-tovuti-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transition-all duration-200 transform hover:scale-105"
            >
              Sign out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center p-3 rounded-xl text-secondary-foreground hover:text-tovuti-primary hover:bg-tovuti-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-tovuti-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transition-all duration-200 shadow-sm"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-secondary to-secondary/95 border-t border-tovuti-primary/30 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="px-4 pt-6 pb-4 space-y-2 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-xl border-b-2 text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-tovuti-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transition-all duration-200 ${getLinkClass(
                  link.path
                )}`}
                tabIndex={0}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-primary-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/90 hover:from-tovuti-primary/90 hover:to-tovuti-primary shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-tovuti-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transition-all duration-200"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
