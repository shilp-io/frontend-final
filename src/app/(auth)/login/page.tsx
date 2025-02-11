// src/app/(auth)/login/page.tsx

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { AlertCircle, Github, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] dark:bg-[#0F0F0F] px-4 py-12">
      <Card className="w-full max-w-md bg-white dark:bg-black shadow-sm dark:shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-black dark:text-gray-100">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 text-sm text-primary dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg bg-gray-200 dark:bg-black border-gray-200 dark:border-gray-700 
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
                  className="rounded-lg bg-gray-200 dark:bg-black border-gray-200 dark:border-gray-700 
                    focus:border-primary dark:focus:border-primary focus:ring-primary dark:focus:ring-primary
                    text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/reset-password"
                className="text-sm font-medium text-primary hover:text-primary dark:text-primary dark:hover:text-accent
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary"
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-accent dark:bg-primary dark:hover:primary
                text-white font-medium py-2 rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary"
            >
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-black dark:bg-black" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full bg-black text-white border border-white hover:bg-white hover:text-black hover:border-gray-100 transition-colors"
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>

            <Button
              variant="outline"
              onClick={handleGithubSignIn}
              className="w-full bg-black text-white border border-white hover:bg-white hover:text-black hover:border-gray-100 transition-colors"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-center w-full text-sm text-gray-600 dark:text-gray-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary dark:text-primary dark:hover:text-primary
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
