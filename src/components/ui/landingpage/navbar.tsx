"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Image from "next/image";
import { AbstractBackground } from "./abstract-background";

export function Navbar() {
  return (
    <header className="py-8 px-6 bg-black text-white border-b border-white">
      <div className="max-h-8">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="atoms-logo  hidden md:flex">
            <Image
              src="/atoms.png"
              alt="Atoms logo"
              width={24}
              height={24}
              className="object-contain dark:invert mx-2"
            />
            <span className="font-semibold text-lg">ATOMS.TECH</span>
          </Link>
          <nav className="hidden md:flex space-x-16">
            <Link
              href="#features"
              className="text-lg text-white hover:text-gray-300 transition-colors uppercase font-bold"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-lg text-white hover:text-gray-300 transition-colors uppercase font-bold"
            >
              How It Works
            </Link>
            <Link
              href="#industries"
              className="text-lg text-white hover:text-gray-300 transition-colors uppercase font-bold"
            >
              Industries
            </Link>
            <Link
              href="/contact"
              className="text-lg text-white hover:text-gray-300 transition-colors uppercase font-bold"
            >
              Contact
            </Link>
          </nav>
          <Button
            variant="outline"
            className="btn-secondary hover:text-black"
            onClick={() => redirect("/login")}
          >
            SIGN IN
          </Button>
        </div>
        <AbstractBackground />
      </div>
    </header>
  );
}
