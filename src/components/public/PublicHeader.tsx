"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  User,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
  Atom,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/hooks";
import { ThemeToggle } from "@/components/public/toggles/ThemeToggle";

const navItems = [
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

const userMenuItems = [
  { name: "Profile", href: "/profile", icon: UserCircle },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Logout", href: "/logout", icon: LogOut },
];

const userLoginItems = [
  { name: "Login", href: "/login", icon: User },
  { name: "Register", href: "/register", icon: UserPlus },
];

export default function PublicHeader() {
  const [activeItem, setActiveItem] = useState("Home");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="w-full max-w-6xl mx-auto px-4 flex items-center">
        {/* Brand Section */}
        <div className="flex items-center mr-12">
          <Link
            href="/"
            className="flex items-center space-x-2 text-foreground"
          >
            <Atom className="w-5 h-5" />
            <span className="font-semibold text-lg">Atoms</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <ul className="flex justify-center space-x-6">
          {navItems.map((item) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: navItems.indexOf(item) * 0.1,
              }}
            >
              <Link
                href={item.href}
                className="text-muted-foreground text-sm font-medium relative py-1 px-2 transition-colors duration-200 ease-in-out hover:text-foreground"
                onClick={() => setActiveItem(item.name)}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="relative z-10">{item.name}</span>
                <motion.div
                  className="absolute inset-0 bg-foreground"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX:
                      hoveredItem === item.name || activeItem === item.name
                        ? 1
                        : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{
                    originX: hoveredItem === item.name ? 0 : 1,
                    opacity: 0.05,
                  }}
                />
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4 ml-auto">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="p-1 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors duration-200"
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-1 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors duration-200"
            >
              <User className="w-5 h-5" />
            </button>

            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-popover/80 backdrop-blur-sm rounded-md shadow-lg py-1 ring-1 ring-border"
              >
                {isLoggedIn
                  ? userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Link>
                  ))
                  : userLoginItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Link>
                  ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
