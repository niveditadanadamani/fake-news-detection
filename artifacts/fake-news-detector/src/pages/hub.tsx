import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Tv, 
  Beaker, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Film,
  Dna,
  Plus,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_CATEGORIES = [
  {
    id: "movies",
    title: "Cinema Intelligence",
    description: "Verified updates on global film production and industry leaks.",
    icon: Film,
    color: "text-purple-400",
    items: [
      { text: "K.G.F: Chapter 2 record breaking stats" },
      { text: "Dhurandhar 2 theatrical release confirmed" }
    ]
  },
  {
    id: "science",
    title: "Scientific Frontier",
    description: "Deep-scanned evidence for breakthroughs and discoveries.",
    icon: Dna,
    color: "text-blue-400",
    items: [
      { text: "Nuclear fusion ignition breakthrough verified" },
      { text: "New planet discovered in Proxima Centauri" }
    ]
  },
  {
    id: "global",
    title: "Global Intel",
    description: "Diplomatic and geopolitical threat assessments.",
    icon: Globe,
    color: "text-emerald-400",
    items: [
      { text: "World climate summit reaching new agreements" },
      { text: "Alien landing in major city yesterday" }
    ]
  },
  {
    id: "entertainment",
    title: "Entertainment Pulse",
    description: "Verified trending media and social influence metrics.",
    icon: Zap,
    color: "text-amber-400",
    items: [
      { text: "Global artist announces world tour dates" },
      { text: "Award ceremony winners list released" }
    ]
  }
];

export default function Hub() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("intel-hub-categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map icons back to the saved state
        const restored = DEFAULT_CATEGORIES.map(def => {
          const matched = parsed.find((p: any) => p.id === def.id);
          return matched ? { ...def, items: matched.items } : def;
        });
        setCategories(restored);
      } catch (e) {
        setCategories(DEFAULT_CATEGORIES);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const toSave = categories.map(c => ({ id: c.id, items: c.items }));
    localStorage.setItem("intel-hub-categories", JSON.stringify(toSave));
  }, [categories]);

  const handleQuickAnalyze = (text: string) => {
    sessionStorage.setItem("pending-analysis", text);
    setLocation("/dashboard");
  };

  const addItem = (categoryId: string) => {
    const text = newItems[categoryId];
    if (!text?.trim()) return;

    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, items: [{ text: text.trim() }, ...cat.items] };
      }
      return cat;
    }));

    setNewItems(prev => ({ ...prev, [categoryId]: "" }));
    toast({ title: "Intelligence Added", description: "Saved to Hub database." });
  };

  const removeItem = (categoryId: string, index: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const newItemsList = [...cat.items];
        newItemsList.splice(index, 1);
        return { ...cat, items: newItemsList };
      }
      return cat;
    }));
  };

  const resetHub = () => {
    setCategories(DEFAULT_CATEGORIES);
    localStorage.removeItem("intel-hub-categories");
    toast({ title: "Hub Reset", description: "All categories restored to factory defaults." });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-sm uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" />
            <span>Operational Management</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight uppercase font-mono">Operations Hub</h1>
          <p className="text-muted-foreground text-lg">Manage and curate your intelligence watchlist vectors.</p>
        </div>
        <div className="flex items-center gap-4 bg-card/30 border border-border/50 p-4 rounded-xl backdrop-blur-sm">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetHub}
            className="font-mono text-[10px] uppercase border-primary/20 hover:bg-primary/10"
          >
            <RefreshCw className="h-3 w-3 mr-2" /> Reset Hub
          </Button>
          <div className="h-8 w-[1px] bg-border/50 mr-2" />
          <div className="text-right">
            <div className="text-sm font-mono text-muted-foreground uppercase opacity-70">Scanner Status</div>
            <div className="text-xs font-mono text-success flex items-center justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              SYSTEM_READY
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <Card key={cat.id} className="group relative overflow-hidden border-border/50 bg-card/40 hover:bg-card/60 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
              <cat.icon size={120} />
            </div>
            
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-background/50 border border-border/50 ${cat.color}`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-tighter opacity-70">
                  {cat.id}_intel_vector
                </Badge>
              </div>
              <CardTitle className="text-2xl font-mono uppercase text-foreground">{cat.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed max-w-sm">
                {cat.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Insert new claim to vector..."
                  className="h-9 bg-background/50 border-border/50 font-mono text-xs focus-visible:ring-primary/30"
                  value={newItems[cat.id] || ""}
                  onChange={(e) => setNewItems(prev => ({ ...prev, [cat.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addItem(cat.id)}
                />
                <Button size="sm" onClick={() => addItem(cat.id)} className="h-9 px-3">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground border-b border-border/30 pb-2">Active Headlines</h4>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-border">
                  {cat.items.length > 0 ? cat.items.map((item, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-transparent hover:border-primary/20 hover:bg-background/60 transition-all group/item"
                    >
                      <button 
                        onClick={() => handleQuickAnalyze(item.text)}
                        className="flex-1 text-left text-sm text-foreground/80 group-hover/item:text-foreground line-clamp-1 pr-4"
                      >
                        {item.text}
                      </button>
                      <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button 
                          onClick={() => removeItem(cat.id, i)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary translate-x-1" />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground/30 font-mono text-xs uppercase tracking-widest">
                      Vector Empty
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
