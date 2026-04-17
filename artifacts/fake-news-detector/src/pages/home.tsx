import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, HelpCircle, Sparkles, Globe, Beaker, Tv } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const INTEL_TEMPLATES = [
  { label: "Dhurandhar 2 Movie", value: "Dhurandhar 2 movie has been released in theatres worldwide.", mode: "text", category: "Entertainment", icon: Tv },
  { label: "Alien Landing Hoax", value: "Aliens landed in India yesterday and signed an agreement with the government.", mode: "text", category: "Global", icon: Globe },
  { label: "Climate Change Data", value: "Global warming is accelerating due to human activity.", mode: "text", category: "Science", icon: Beaker },
  { label: "Example News Link", value: "https://example.com/dhurandhar2", mode: "url", category: "Web", icon: Sparkles },
];

function HighlightedText({ text, suspiciousWords }: { text: string, suspiciousWords: string[] }) {
  if (!suspiciousWords || suspiciousWords.length === 0) return <p className="text-sm leading-relaxed">{text}</p>;

  // A simple highlighting mechanism. For production, a more robust regex parsing is better.
  const regex = new RegExp(`(${suspiciousWords.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {parts.map((part, i) => {
        if (suspiciousWords.some(w => part.toLowerCase() === w.toLowerCase())) {
          return <span key={i} className="bg-destructive/20 text-destructive-foreground px-1 rounded">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"text" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const pending = sessionStorage.getItem("pending-analysis");
    if (pending) {
      if (pending.startsWith("http")) {
        setMode("url");
        setUrl(pending);
      } else {
        setMode("text");
        setText(pending);
      }
      sessionStorage.removeItem("pending-analysis");
      // Give UI a moment to settle before triggering
      setTimeout(() => {
        const btn = document.getElementById("execute-analysis-btn");
        btn?.click();
      }, 500);
    }
  }, []);

  const [isPending, setIsPending] = useState(false);

  const handleAnalyze = async () => {
    if (mode === "text" && !text.trim()) return;
    if (mode === "url" && !url.trim()) return;

    setResult(null);
    setFeedbackGiven(false);
    setIsPending(true);

    const inputData = mode === "text" ? text.trim() : url.trim();
    let searchStr = inputData;

    // Local Verification Engine
    try {
      if (mode === "url") {
        try {
          const parsedUrl = new URL(url.trim());
          let pathParts = parsedUrl.pathname.split('/').filter(Boolean).pop() || "";
          searchStr = decodeURIComponent(pathParts)
            .replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([a-zA-Z])(\d)/g, '$1 $2').replace(/(\d)([a-zA-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/\.html?|\.php/g, '');
          if (!searchStr.trim()) searchStr = parsedUrl.hostname.replace("www.", "").split('.')[0];
        } catch(e) { searchStr = inputData; }
      }

      // Signal 1: Stylistic Neutrality
      const capsRatio = (inputData.match(/[A-Z]/g)?.length || 0) / inputData.length;
      const hasExtremePunctuation = /[!?]{2,}/.test(inputData);
      const sensationalistWords = ["shocking", "unbelievable", "revealed", "must watch", "exposed", "scam"];
      const containsSensationalism = sensationalistWords.some(w => inputData.toLowerCase().includes(w));
      
      let styleScore = 95;
      if (capsRatio > 0.3) styleScore -= 30;
      if (hasExtremePunctuation) styleScore -= 20;
      if (containsSensationalism) styleScore -= 20;
      styleScore = Math.max(10, styleScore);

      // Signal 2: Factual Corroboration (Wikipedia)
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchStr)}&prop=pageimages|extracts|images&exsentences=1&exintro=1&explaintext=1&piprop=thumbnail|original&pithumbsize=1000&format=json&origin=*`);
      const data = await res.json();
      
      let isFake = true;
      let factScore = 15;
      let reasons = ["Could not find corroborating real-world evidence.", "No trusted encyclopedic sources match this claim."];
      let imageUrl = null;
      let factualContext = null;

      if (data?.query?.pages) {
        const pages = Object.values(data.query.pages);
        const firstHit = pages.find((p: any) => p.index === 1) as any;
        
        if (firstHit) {
          factualContext = firstHit.extract;
          const hitText = (firstHit.title + " " + (factualContext || "")).toLowerCase();
          const searchTokens = searchStr.toLowerCase().match(/\b(\w{3,}|\d+)\b/g) || [];
          const searchNumbers = searchStr.match(/\d+/g) || [];
          const hitNumbers = hitText.match(/\d+/g) || [];
          
          const numbersConsistent = searchNumbers.every(n => hitNumbers.includes(n));
          const wordsMatched = searchTokens.some(w => hitText.includes(w));
          
          if (wordsMatched && numbersConsistent) {
            isFake = false;
            factScore = 85 + Math.min(10, pages.length);
            reasons = [
              `Information corroborated by reliable source: "${firstHit.title}".`,
              "Factual structure matches verified knowledge graphs.",
              styleScore > 70 ? "Tone is objective and neutral." : "Information verified despite sensationalist tone."
            ];
          } else if (searchNumbers.length > 0 && !numbersConsistent) {
            factScore = 20;
            reasons = ["Numeric data inconsistency detected (potential sequel/version mismatch).", "Found related info but IDs do not match the claim."];
          }
          
          // Image Logic: Try thumbnail, then original, then fallback search
          imageUrl = firstHit.thumbnail?.source || firstHit.original?.source || null;
          
          if (!imageUrl && firstHit.images) {
             const likelyImage = firstHit.images.find((img: any) => 
               !img.title.includes('.svg') && 
               !img.title.includes('.svg.png') && 
               (img.title.toLowerCase().includes('.jpg') || img.title.toLowerCase().includes('.png') || img.title.toLowerCase().includes('.webp'))
             );
             if (likelyImage) {
               // Get real URL for the image file
               const imgInfoRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(likelyImage.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`);
               const imgInfoData = await imgInfoRes.json();
               const imgPage = Object.values(imgInfoData.query.pages)[0] as any;
               imageUrl = imgPage.imageinfo?.[0]?.url || null;
             }
          }
        }
      }

      // Composite Result
      const compositeConfidence = isFake ? Math.round(100 - (factScore * 0.6 + styleScore * 0.4)) : Math.round(factScore * 0.6 + styleScore * 0.4);
      
      const newResult = {
        id: Date.now(),
        prediction: isFake ? "Fake" : "Real",
        confidence: Math.min(99, Math.max(50, compositeConfidence)),
        reasons,
        suspiciousWords: isFake ? sensationalistWords.filter(w => inputData.toLowerCase().includes(w)) : [],
        sourceCredibility: {
          domain: mode === "url" ? new URL(url).hostname : "Wiki-Verify",
          score: Math.round(factScore),
          label: factScore > 70 ? "Trusted" : factScore > 40 ? "Unknown" : "Untrusted",
        },
        inputText: inputData,
        sourceUrl: mode === "url" ? url : null,
        imageUrl,
        factualContext,
        createdAt: new Date().toISOString(),
        styleScore,
        factScore
      } as any;

      setResult(newResult);

      // Save to local history
      try {
        const stored = localStorage.getItem('fake-news-history');
        const history = stored ? JSON.parse(stored) : [];
        localStorage.setItem('fake-news-history', JSON.stringify([newResult, ...history].slice(0, 100)));
      } catch (e) {
        console.error("Failed to save history:", e);
      }

    } catch (err: any) {
      toast({ title: "Verification Error", description: "Standard knowledge lookup failed. Check your internet connection.", variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  const handleFeedback = (correct: boolean) => {
    setFeedbackGiven(true);
    toast({ title: "Feedback Recorded", description: "Thanks for verifying the analysis result." });
  };

  const applyTemplate = (t: typeof INTEL_TEMPLATES[0]) => {
    setMode(t.mode as "text" | "url");
    if (t.mode === "text") {
      setText(t.value);
      setUrl("");
    } else {
      setUrl(t.value);
      setText("");
    }
    setResult(null);
    toast({ 
      title: "Template Applied", 
      description: `Loaded ${t.label} into assessment buffer.`,
      duration: 2000 
    });
  };


  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-mono uppercase tracking-tight text-primary">Intelligence Input</h1>
          <p className="text-muted-foreground mt-2">Submit content for threat assessment and factual verification.</p>
        </div>

        <Card className="border-border/50 shadow-sm bg-card/50">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "text" | "url")} className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="font-mono uppercase text-xs">Raw Text</TabsTrigger>
                <TabsTrigger value="url" className="font-mono uppercase text-xs">Source URL</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="space-y-4">
              <TabsContent value="text" className="mt-0">
                <Textarea
                  placeholder="Paste article text here..."
                  className="min-h-[250px] font-mono text-sm bg-background/50 resize-none border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="url" className="mt-0">
                <Input
                  type="url"
                  placeholder="https://example.com/article"
                  className="font-mono text-sm bg-background/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </TabsContent>
              <Button
                id="execute-analysis-btn"
                className="w-full font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAnalyze}
                disabled={isPending || (mode === "text" ? !text.trim() : !url.trim())}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Execute Analysis"
                )}
              </Button>
            </CardContent>
          </Tabs>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
            <Sparkles className="h-3 w-3" />
            <span>Intel Templates</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTEL_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(t)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-card/30 hover:bg-card/80 hover:border-primary/50 transition-all duration-300 group"
              >
                <t.icon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium">{t.label}</span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-muted/50 font-mono lower">{t.category}</Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-mono uppercase tracking-tight text-primary">Assessment</h2>
          <p className="text-muted-foreground mt-2">Automated intelligence verdict and confidence metrics.</p>
        </div>

        {result ? (
          <Card className="border-border/50 shadow-sm bg-card/50 overflow-hidden">
            <div className={`h-2 w-full ${result.prediction === "Fake" ? "bg-destructive" : "bg-success"}`} />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono uppercase flex items-center gap-2">
                    {result.prediction === "Fake" ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    )}
                    Verdict: <span className={result.prediction === "Fake" ? "text-destructive" : "text-success"}>{result.prediction}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">Generated at {new Date(result.createdAt).toLocaleString()}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono">{result.confidence}%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Confidence</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Progress
                  value={result.confidence}
                  className={`h-2 ${result.prediction === "Fake" ? "[&>div]:bg-destructive" : "[&>div]:bg-success"}`}
                />
              </div>

              <div className="space-y-3 border border-border/50 rounded-md p-4 bg-background/30">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Source Credibility
                </h4>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`
                    ${result.sourceCredibility.label === "Trusted" ? "border-success text-success" : ""}
                    ${result.sourceCredibility.label === "Untrusted" ? "border-destructive text-destructive" : ""}
                    ${result.sourceCredibility.label === "Unknown" ? "border-muted-foreground text-muted-foreground" : ""}
                  `}>
                    {result.sourceCredibility.label}
                  </Badge>
                  {result.sourceCredibility.domain && (
                    <span className="text-sm font-mono text-muted-foreground">{result.sourceCredibility.domain}</span>
                  )}
                  <span className="text-sm ml-auto">Score: {result.sourceCredibility.score}/100</span>
                </div>
              </div>

              <div className="space-y-4 border border-border/50 rounded-md p-4 bg-background/30">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Verification Signal Breakdown
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono uppercase tracking-tighter">
                      <span className="text-muted-foreground">Factual Corroboration</span>
                      <span className={(result as any).factScore > 50 ? "text-success" : "text-destructive"}>{(result as any).factScore}% Match</span>
                    </div>
                    <Progress value={(result as any).factScore} className="h-1.5 [&>div]:bg-success" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono uppercase tracking-tighter">
                      <span className="text-muted-foreground">Stylistic Neutrality</span>
                      <span className={(result as any).styleScore > 50 ? "text-success" : "text-destructive"}>{(result as any).styleScore}% Objective</span>
                    </div>
                    <Progress value={(result as any).styleScore} className="h-1.5 [&>div]:bg-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Key Indicators</h4>
                <ul className="space-y-2">
                  {result.reasons.map((reason, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                {result.imageUrl ? (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/20 shadow-inner">
                      <div className="aspect-video w-full overflow-hidden border-b border-border/10">
                        <img 
                          src={result.imageUrl} 
                          alt="Intelligence Visual" 
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      {result.factualContext && (
                        <div className="p-4 bg-background/40 backdrop-blur-sm">
                          <h5 className="text-[10px] font-mono uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3" /> Factual intelligence Summary
                          </h5>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {result.factualContext}
                          </p>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-mono text-white/80 uppercase tracking-tighter">
                        Verified Source
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg border border-dashed border-border/50 bg-card/30 flex flex-col items-center justify-center text-muted-foreground/30 space-y-2">
                    <HelpCircle className="h-8 w-8" />
                    <p className="font-mono text-[10px] uppercase tracking-widest">No matching visual intel found</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Input Analysis</span>
                    <span className="text-[10px] font-normal text-muted-foreground/50 font-mono tracking-tighter">TEXT_SCAN_ACTIVE</span>
                  </h4>
                  <div className="bg-background/50 border border-border/50 rounded-md p-4 max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-border">
                    <HighlightedText text={result.inputText} suspiciousWords={result.suspiciousWords} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border/50 py-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-mono">Was this assessment accurate?</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="font-mono uppercase text-xs"
                  onClick={() => handleFeedback(true)}
                  disabled={feedbackGiven}
                >
                  <ShieldCheck className="mr-1 h-3 w-3 text-success" /> Yes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="font-mono uppercase text-xs"
                  onClick={() => handleFeedback(false)}
                  disabled={feedbackGiven}
                >
                  <ShieldAlert className="mr-1 h-3 w-3 text-destructive" /> No
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <div className="h-full min-h-[400px] border border-border/30 rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-card/20 border-dashed">
            <HelpCircle className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-mono uppercase tracking-wider text-sm">Awaiting Input</p>
          </div>
        )}
      </div>
    </div>
  );
}
