"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await registerUser({ email, password, displayName: name });
      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes("auth/email-already-in-use")) {
          setError(
            "This email is already in use. Please try another email address.",
          );
        } else if (errorMessage.includes("auth/weak-password")) {
          setError(
            "Please choose a stronger password. It should be at least 6 characters long.",
          );
        } else if (errorMessage.includes("auth/invalid-email")) {
          setError("Please enter a valid email address.");
        } else if (errorMessage.includes("auth/network-request-failed")) {
          setError(
            "Network error. Please check your internet connection and try again.",
          );
        } else {
          setError("An error occurred during registration. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] dark:bg-[#0F0F0F] px-4 py-12">
        <Card className="w-full max-w-md bg-white dark:bg-black shadow-sm dark:shadow-lg border-gray-200 dark:border-gray-700 z-10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Sign up to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-400 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-3 border-red-100 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                    focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary
                    text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                    focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary
                    text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                    focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary
                    text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                    focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary
                    text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:text-primary hover:bg-white border border-primary  dark:bg-primary dark:hover:bg-primary
                text-white font-medium py-2 rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary"
              >
                Sign up
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-center w-full text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary  dark:text-primary dark:hover:text-primary
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
