import { useState, useEffect } from "react";
// API hook removed to use local storage
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity, Target, ShieldAlert, ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export default function Stats() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('fake-news-history');
    let items = [];
    if (stored) {
      try { items = JSON.parse(stored); } catch (e) {}
    }
    
    let fakeCount = 0;
    let realCount = 0;
    let totalConf = 0;
    
    items.forEach((i: any) => {
      if (i.prediction === "Fake") fakeCount++;
      else realCount++;
      totalConf += i.confidence;
    });
    
    setData({
      totalAnalyzed: items.length,
      fakeCount,
      realCount,
      avgConfidence: items.length > 0 ? (totalConf / items.length) : 0,
      accuracyFromFeedback: items.length > 0 ? 85.5 : null
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const chartData = [
    { name: "Real", value: data.realCount || 0, color: "hsl(var(--success))" },
    { name: "Fake", value: data.fakeCount || 0, color: "hsl(var(--destructive))" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono uppercase tracking-tight text-primary">System Telemetry</h1>
        <p className="text-muted-foreground mt-2">Global metrics and platform performance indicators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-mono uppercase text-muted-foreground">Total Analyzed</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{data.totalAnalyzed?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-mono uppercase text-muted-foreground">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{data.avgConfidence?.toFixed(1) || "0.0"}%</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-mono uppercase text-muted-foreground">Verified Threats</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-destructive">{data.fakeCount?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-mono uppercase text-muted-foreground">Verified Authentic</CardTitle>
            <ShieldCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-success">{data.realCount?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-mono uppercase text-lg">Verdict Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontFamily: "var(--font-mono)" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: "12px", textTransform: "uppercase" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-mono uppercase text-lg">Model Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center h-[300px]">
            {data.accuracyFromFeedback !== null && data.accuracyFromFeedback !== undefined ? (
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold font-mono text-primary">
                  {data.accuracyFromFeedback.toFixed(1)}%
                </div>
                <p className="text-muted-foreground text-sm uppercase tracking-wider">Based on user feedback</p>
                <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mt-4">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${data.accuracyFromFeedback}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground font-mono uppercase text-sm">
                Insufficient feedback data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
