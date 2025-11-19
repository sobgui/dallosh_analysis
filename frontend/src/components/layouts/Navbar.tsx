"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores";
import { rolesService } from "@/services";

export function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isAuthenticated || !user?.data.roleId) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const role = await rolesService.findOne(user.data.roleId);
        const hasAdmin = role?.data.permissions.includes("manage_app") ?? false;
        setIsAdmin(hasAdmin);
      } catch (error) {
        console.error("Failed to check admin role:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      checkAdminRole();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    // Use hard redirect to ensure complete logout and state reset
    window.location.href = "/landing";
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-sm font-bold">D</span>
            </div>
            <span className="text-foreground">Dallosh Analysis</span>
          </Link>
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="#contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          )}
          {isAuthenticated && !loading && (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/home/overview" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/home/datasets" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Datasets
              </Link>
              {isAdmin && (
                <Link href="/admin/overview" className="text-sm font-medium text-primary hover:text-primary/80">
                  Go to Admin Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {isAuthenticated ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              
              <Link href="/auth">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Login</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

