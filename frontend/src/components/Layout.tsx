import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-tovuti-secondary via-tovuti-secondary/95 to-tovuti-secondary/90 text-foreground">
      <Header />
      {/* Main Content */}
      <main className="max-w-9xl mx-auto py-8 sm:px-6 lg:px-8 relative">
        <div className="bg-background/50 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
