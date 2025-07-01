import { useState, FormEvent, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import logo from "/images/logo.png";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      let userCredential;
      if (isSignup) {
        if (!name) {
          setError("Name is required for signup.");
          setIsProcessing(false);
          return;
        }
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: name });
        localStorage.setItem("token", userCredential.user.uid);
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        localStorage.setItem("token", userCredential.user.uid);
      }
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-tovuti-primary/20 to-tovuti-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-tovuti-primary/15 to-tovuti-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-tovuti-primary to-foreground/70 rounded-2xl shadow-2xl flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-200">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-center text-3xl sm:text-4xl bg-gradient-to-r from-card-foreground to-card-foreground/80 bg-clip-text text-transparent">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {isSignup
              ? "Join ClientSync to manage your business relationships"
              : "Sign in to access your dashboard"}
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 p-8 sm:p-10 space-y-8">
          {error && (
            <div className="rounded-xl bg-gradient-to-r from-destructive/10 to-destructive/5 p-4 border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-destructive mr-3 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-destructive font-medium">
                  {error}
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-card-foreground mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignup}
                  className="appearance-none block w-full px-4 py-3 border border-border rounded-xl shadow-sm placeholder-muted-foreground text-foreground bg-input/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-tovuti-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-card sm:text-sm transition-all duration-200 hover:border-tovuti-primary/50"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={isProcessing}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-border rounded-xl shadow-sm placeholder-muted-foreground text-foreground bg-input/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-tovuti-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-card sm:text-sm transition-all duration-200 hover:border-tovuti-primary/50"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full px-4 py-3 border border-border rounded-xl placeholder-muted-foreground text-foreground bg-input/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-tovuti-primary focus:border-transparent focus:ring-offset-1 focus:ring-offset-card sm:text-sm transition-all duration-200 pr-12 hover:border-tovuti-primary/50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  disabled={isProcessing}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-tovuti-primary focus:outline-none p-2 rounded-lg transition-colors duration-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={isProcessing}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-primary-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/90 hover:from-tovuti-primary/90 hover:to-tovuti-primary shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-tovuti-primary focus:ring-offset-2 focus:ring-offset-card disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : isSignup ? (
                  "Create Account"
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-border/30">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="font-semibold text-tovuti-primary hover:text-tovuti-primary/80 hover:underline disabled:opacity-70 transition-all duration-200 transform hover:scale-105"
              disabled={isProcessing}
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
