import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("operator@intel.co");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast({
      title: "Authentication Successful",
      description: "Welcome back to the Threat Intel Dashboard.",
    });

    // Mock redirect
    setLocation("/hub");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md mx-auto z-10">
        <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative scanner line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse opacity-50" />
          
          <div className="flex flex-col items-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full mb-4 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">System Login</h1>
            <p className="text-sm text-muted-foreground mt-2">Any email and password will work for demo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/80 uppercase tracking-wider" htmlFor="email">
                Operator ID (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="operator@intel.co"
                  className="w-full pl-10 pr-4 py-2 border border-border bg-background/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground/80 uppercase tracking-wider" htmlFor="password">
                  Security Key
                </label>
                <a href="#" className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors">
                  Reset Key?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type="password"
                  className="w-full pl-10 pr-4 py-2 border border-border bg-background/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-lg text-sm font-semibold transition-all group overflow-hidden relative"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="relative z-10">Initialize Session</span>
                  <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have clearance? <a href="#" className="text-primary hover:underline font-medium">Request access</a>
          </p>
        </div>
      </div>
    </div>
  );
}
