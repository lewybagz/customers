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
      ? "border-squadspot-primary text-squadspot-primary bg-secondary/60"
      : "border-transparent text-muted-foreground hover:border-squadspot-primary hover:text-squadspot-primary hover:bg-secondary/40 transition-colors";

  return (
    <header className="bg-secondary text-secondary-foreground shadow-lg sticky top-0 z-30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0">
            <span className="text-2xl font-bold tracking-tight text-squadspot-primary font-aldrich select-none">
              ClientSync
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center px-3 py-2 rounded-md border-b-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-squadspot-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary ${getLinkClass(
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
              className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-squadspot-primary hover:bg-squadspot-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-squadspot-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-foreground hover:text-squadspot-primary hover:bg-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-squadspot-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
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
        <div className="md:hidden bg-secondary border-t border-border shadow-lg animate-in fade-in duration-200">
          <div className="px-4 pt-4 pb-2 space-y-1 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md border-b-2 text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-squadspot-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary ${getLinkClass(
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
              className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-squadspot-primary hover:bg-squadspot-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-squadspot-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
