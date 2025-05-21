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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-transparent p-8 sm:p-10">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-card-foreground">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3">
            <div className="text-sm text-destructive font-medium">{error}</div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {isSignup && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-card-foreground mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required={isSignup}
                className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-squadspot-primary focus:border-squadspot-primary focus:ring-offset-1 focus:ring-offset-background sm:text-sm transition-colors"
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
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-squadspot-primary focus:border-squadspot-primary focus:ring-offset-1 focus:ring-offset-background sm:text-sm transition-colors"
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
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none block w-full px-3 py-2 border border-border rounded-md placeholder-muted-foreground text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-squadspot-primary focus:border-squadspot-primary focus:ring-offset-1 focus:ring-offset-background sm:text-sm transition-colors pr-10"
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
                  className="text-muted-foreground hover:text-squadspot-primary focus:outline-none p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-squadspot-primary hover:bg-squadspot-primary/90 focus:outline-none focus:ring-2 focus:ring-squadspot-primary focus:ring-offset-2 focus:ring-offset-card disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="font-medium text-squadspot-primary hover:text-squadspot-primary/80 hover:underline disabled:opacity-70 transition-colors"
            disabled={isProcessing}
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
