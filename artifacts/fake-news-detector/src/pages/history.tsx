import { useState, useEffect } from "react";
// API hook removed to use local storage
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function History() {
  const [page, setPage] = useState(0);
  const limit = 20;
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ items: any[] }>({ items: [] });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = data.items.filter(item => {
    const sourceDisplay = item.sourceUrl ? item.sourceUrl.replace(/^https?:\/\//, '').split('/')[0] : (item.sourceDomain || "");
    return item.inputText.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.prediction.toLowerCase().includes(searchQuery.toLowerCase()) ||
           sourceDisplay.toLowerCase().includes(searchQuery.toLowerCase());
  });
  

  useEffect(() => {
    const stored = localStorage.getItem('fake-news-history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({ items: parsed });
      } catch (e) {}
    }
    setIsLoading(false);
  }, []);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updatedItems = data.items.filter(item => item.id !== id);
    setData({ items: updatedItems });
    localStorage.setItem('fake-news-history', JSON.stringify(updatedItems));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono uppercase tracking-tight text-primary">Intelligence Archive</h1>
        <p className="text-muted-foreground mt-2">Historical record of all processed threat assessments.</p>
      </div>

      <Card className="border-border/50 shadow-sm bg-card/50">
        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-border/50">
          <div className="space-y-1">
            <CardTitle className="font-mono uppercase text-lg">Assessment Log</CardTitle>
            <CardDescription>Showing {filteredItems.length} recent queries</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter logs..."
              className="pl-9 bg-background/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary font-mono text-sm h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-mono text-xs uppercase w-[180px]">Timestamp</TableHead>
                  <TableHead className="font-mono text-xs uppercase w-[120px]">Verdict</TableHead>
                  <TableHead className="font-mono text-xs uppercase w-[100px]">Confidence</TableHead>
                  <TableHead className="font-mono text-xs uppercase w-[120px]">Source</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Snippet</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/20 border-border/50 cursor-pointer">
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.prediction === "Fake" ? "destructive" : "default"} className={item.prediction === "Real" ? "bg-success hover:bg-success" : ""}>
                        {item.prediction}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.confidence}%
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.sourceUrl || item.sourceDomain ? (
                        <span className="truncate block max-w-[150px] text-muted-foreground" title={item.sourceUrl || item.sourceDomain}>
                          {item.sourceUrl ? item.sourceUrl.replace(/^https?:\/\//, '').split('/')[0] : item.sourceDomain}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 italic">Text</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm truncate max-w-[300px] text-muted-foreground">
                      {item.inputText.substring(0, 80)}...
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, item.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredItems.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-mono uppercase text-sm">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
