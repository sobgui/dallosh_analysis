"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import type { Permission } from "@/types";

export function Login() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("admin@free.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      
      // Wait a bit for the state to be persisted and updated
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Get user and check role for redirect
      const user = useAuthStore.getState().user;
      if (user?.data.roleId) {
        try {
          const { rolesService } = await import("@/services");
          const role = await rolesService.findOne(user.data.roleId);
          if (role?.data.permissions.includes("manage_app")) {
            // Use window.location for a hard redirect to ensure it works
            window.location.href = "/admin/overview";
          } else {
            window.location.href = "/home/overview";
          }
        } catch {
          window.location.href = "/home/overview";
        }
      } else {
        window.location.href = "/home/overview";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="admin@free.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 border-border/50 focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 border-border/50 focus:border-primary focus:ring-primary"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-foreground">
            Remember me
          </Label>
        </div>
        <a href="#" className="text-sm text-primary hover:underline font-medium">
          Forgot password?
        </a>
      </div>
      <Button 
        type="submit" 
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      
    </form>
  );
}

