"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { Button } from "@/components/ui/button";
import { GuestGuard } from "@/guards";
import {
  BarChart3,
  Users,
  Lightbulb,
  Moon,
  Sun,
} from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { theme, setTheme } = useTheme();

  return (
    <GuestGuard>
      <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-primary text-primary-foreground p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <BarChart3 className="h-10 w-10 text-white" />
              <h1 className="text-4xl font-bold text-white">Dallosh Analysis</h1>
            </div>
            <p className="text-lg text-white/90 leading-relaxed">
              Transform customer complaints into actionable insights with powerful data visualization
            </p>
          </div>
          <div className="flex gap-6 justify-center mt-16">
            <div className="flex flex-col items-center text-center">
              <Users className="h-10 w-10 mb-3 text-white" />
              <span className="text-sm text-white/90">Customer Insights</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="h-10 w-10 mb-3 text-white" />
              <span className="text-sm text-white/90">Analytics</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Lightbulb className="h-10 w-10 mb-3 text-white" />
              <span className="text-sm text-white/90">Smart Reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col lg:items-center lg:justify-center p-6 sm:p-8 bg-background relative">
        {/* Dark mode toggle */}
        <div className="absolute top-6 right-6 lg:top-8 lg:right-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8 mt-8 lg:mt-0">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              Welcome Back
            </h2>
            
          </div>

          <Tabs value="login" className="w-full">
            
            <TabsContent value="login" className="mt-8">
              <Login />
            </TabsContent>
            
            
          </Tabs>
        </div>
      </div>
    </div>
    </GuestGuard>
  );
}

