"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Image from "next/image";
import { AbstractBackground } from "./abstract-background";

export function Navbar() {
  return (
    <header className="min-h-16 px-6 py-3 bg-black text-white border-b border-1px border-white ">
      <div className="">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="atoms-logo  hidden md:flex">
            <Image
              src="/atoms.png"
              alt="Atoms logo"
              width={24}
              height={24}
              className="object-contain invert mx-2"
            />
            <span className="font-semibold text-lg">ATOMS.TECH</span>
          </Link>
          <nav className="hidden md:flex space-x-16">
            <Link
              href="#features"
              className="relative group text-lg text-white hover:text-gray-300 transition-colors uppercase font-bold"
            >
              Features
              <div className="absolute w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="#how-it-works"
              className="relative group text-lg text-white hover:text-gray-300 transition-colors uppercase font-bold"
            >
              How It Works
              <div className="absolute w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="#industries"
              className="relative group text-lg text-white hover:text-gray-300 transition-colors uppercase font-bold"
            >
              Industries
              <div className="absolute w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="#contact"
              className="relative group text-lg text-white hover:text-gray-300 transition-colors uppercase font-bold"
            >
              Contact
              <div className="absolute w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>
          <Button
            variant="outline"
            className="btn-secondary bg-black hover:bg-white hover:text-black"
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
