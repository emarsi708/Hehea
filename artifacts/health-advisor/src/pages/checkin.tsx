import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HeartPulse, Smile, Zap, Moon, Droplet, Dumbbell, Flame, Calendar, Check } from "lucide-react";
import { useHealthReport, useCurrentProfile, type CheckIn } from "@/hooks/use-health-report";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, parseISO } from "date-fns";

const MOOD_LABELS = ["", "Awful", "Low", "Okay", "Good", "Great"];
const ENERGY_LABELS = ["", "Drained", "Tired", "Average", "Energetic", "Buzzing"];

export default function CheckInPage() {
  const profile = useCurrentProfile();
  const { saveCheckIn } = useHealthReport();
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  const checkIns = profile?.checkIns ?? [];
  const todayEntry = checkIns.find(c => c.date === today);

  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(todayEntry?.mood ?? 3);
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5>(todayEntry?.energy ?? 3);
  const [sleepHours, setSleepHours] = useState<number>(todayEntry?.sleepHours ?? 7);
  const [waterGlasses, setWaterGlasses] = useState<number>(todayEntry?.waterGlasses ?? 6);
  const [exercised, setExercised] = useState<boolean>(todayEntry?.exercised ?? false);
  const [notes, setNotes] = useState<string>(todayEntry?.notes ?? "");

  const streak = useMemo(() => {
    if (!checkIns.length) return 0;
    const dates = new Set(checkIns.map(c => c.date));
    let s = 0;
    let d = new Date();
    while (dates.has(format(d, "yyyy-MM-dd"))) {
      s++;
      d = subDays(d, 1);
    }
    return s;
  }, [checkIns]);

  const chartData = useMemo(() => {
    return [...checkIns]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map(c => ({
        date: format(parseISO(c.date), "MMM d"),
        Mood: c.mood,
        Energy: c.energy,
        Sleep: c.sleepHours,
        Water: c.waterGlasses,
      }));
  }, [checkIns]);

  const handleSave = () => {
    const entry: CheckIn = { date: today, mood, energy, sleepHours, waterGlasses, exercised, notes };
    saveCheckIn(entry);
    toast({ title: todayEntry ? "Check-in updated" : "Check-in saved", description: streak > 0 ? `${streak + (todayEntry ? 0 : 1)} day streak!` : undefined });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HeartPulse className="h-7 w-7 text-primary" />
              Daily Check-In
            </h1>
            <p className="text-muted-foreground mt-1">
              How are you feeling today, {profile?.name ?? "friend"}?
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full font-bold">
              <Flame className="h-5 w-5" />
              {streak}-day streak
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today, {format(new Date(), "EEEE, MMM d")}
              </CardTitle>
              <CardDescription>{todayEntry ? "Already logged. Update if anything changed." : "Takes 30 seconds."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RatingRow icon={Smile} label="Mood" value={mood} onChange={v => setMood(v as 1 | 2 | 3 | 4 | 5)} labels={MOOD_LABELS} />
              <RatingRow icon={Zap} label="Energy" value={energy} onChange={v => setEnergy(v as 1 | 2 | 3 | 4 | 5)} labels={ENERGY_LABELS} />

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Moon className="h-4 w-4 text-primary" /> Sleep last night</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    value={sleepHours}
                    onChange={e => setSleepHours(parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Droplet className="h-4 w-4 text-primary" /> Water today</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[2, 4, 6, 8, 10].map(g => (
                    <Button
                      key={g}
                      type="button"
                      size="sm"
                      variant={waterGlasses === g ? "default" : "outline"}
                      onClick={() => setWaterGlasses(g)}
                    >
                      {g} glasses
                    </Button>
                  ))}
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={waterGlasses}
                    onChange={e => setWaterGlasses(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Dumbbell className="h-4 w-4 text-primary" /> Movement / exercise</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={exercised ? "default" : "outline"} size="sm" onClick={() => setExercised(true)}>
                    <Check className="h-3 w-3 mr-1" /> Yes, I moved
                  </Button>
                  <Button type="button" variant={!exercised ? "default" : "outline"} size="sm" onClick={() => setExercised(false)}>
                    Not really
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Headache, stress, what you ate..."
                  rows={2}
                />
              </div>

              <Button onClick={handleSave} size="lg" className="w-full">
                {todayEntry ? "Update check-in" : "Save check-in"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last 30 days</CardTitle>
              <CardDescription>{checkIns.length} total check-ins logged</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <HeartPulse className="h-12 w-12 mx-auto opacity-30 mb-3" />
                  <p>Save your first check-in to see trends.</p>
                </div>
              ) : (
                <>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="Mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Energy" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Sleep" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Water" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Avg label="Avg mood" value={avg(checkIns.map(c => c.mood))} suffix="/ 5" />
                    <Avg label="Avg energy" value={avg(checkIns.map(c => c.energy))} suffix="/ 5" />
                    <Avg label="Avg sleep" value={avg(checkIns.map(c => c.sleepHours))} suffix="hrs" />
                    <Avg label="Workout days" value={(checkIns.filter(c => c.exercised).length / checkIns.length) * 100} suffix="%" int />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RatingRow({ icon: Icon, label, value, onChange, labels }: {
  icon: typeof Smile; label: string; value: number; onChange: (n: number) => void; labels: string[];
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /> {label}: <span className="text-muted-foreground font-normal">{labels[value]}</span></Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <Button
            key={n}
            type="button"
            variant={value === n ? "default" : "outline"}
            size="icon"
            className="flex-1 h-12 text-lg"
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Avg({ label, value, suffix, int }: { label: string; value: number; suffix: string; int?: boolean }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold">{int ? Math.round(value) : value.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{suffix}</span></div>
    </div>
  );
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
