import { Link, useLocation } from "wouter";
import { Shield, History, BarChart3, Activity, LogOut } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/hub", label: "Hub", icon: Shield },
    { href: "/dashboard", label: "Analysis", icon: Activity },
    { href: "/history", label: "History", icon: History },
    { href: "/stats", label: "Statistics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans dark">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight uppercase font-mono text-primary">Threat Intel</span>
          </div>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            
            {location !== "/" && location !== "/login" && (
              <div className="ml-4 pl-4 border-l border-border">
                <Link href="/" className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2 shadow-sm">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
