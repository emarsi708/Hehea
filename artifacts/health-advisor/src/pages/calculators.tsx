import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Navbar } from "@/components/layout/Navbar";
import { Calculator, Heart, Droplet, Scale } from "lucide-react";
import { calcBmi, calcBmr, calcIdealWeight, calcAscvd, calcFindrisc, CalcResult } from "@/lib/calculators";

function ResultBox({ r }: { r: CalcResult | null }) {
  if (!r) return null;
  const color = r.severity === "warn" ? "border-red-500/50 bg-red-50 dark:bg-red-950/20" :
    r.severity === "watch" ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20" :
    "border-green-500/50 bg-green-50 dark:bg-green-950/20";
  return (
    <div className={`mt-4 p-4 rounded-lg border-2 ${color}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{r.value}</span>
        <span className="text-sm text-muted-foreground">{r.unit}</span>
      </div>
      <div className="font-semibold mt-1">{r.category}</div>
      <p className="text-sm text-muted-foreground mt-1">{r.explanation}</p>
    </div>
  );
}

export default function Calculators() {
  const [bmi, setBmi] = useState<CalcResult | null>(null);
  const [bmiH, setBmiH] = useState(""); const [bmiW, setBmiW] = useState("");

  const [bmr, setBmr] = useState<CalcResult | null>(null);
  const [bmrW, setBmrW] = useState(""); const [bmrH, setBmrH] = useState(""); const [bmrA, setBmrA] = useState(""); const [bmrG, setBmrG] = useState<"male" | "female">("male");

  const [iw, setIw] = useState<CalcResult | null>(null);
  const [iwH, setIwH] = useState(""); const [iwG, setIwG] = useState<"male" | "female">("male");

  const [ascvd, setAscvd] = useState<CalcResult | null>(null);
  const [aAge, setAAge] = useState(""); const [aGender, setAGender] = useState<"male" | "female">("male");
  const [aTC, setATC] = useState(""); const [aHDL, setAHDL] = useState(""); const [aSBP, setASBP] = useState("");
  const [aSmoker, setASmoker] = useState(false); const [aDM, setADM] = useState(false); const [aBPT, setABPT] = useState(false);

  const [find, setFind] = useState<CalcResult | null>(null);
  const [fAge, setFAge] = useState(""); const [fBmi, setFBmi] = useState(""); const [fWaist, setFWaist] = useState(""); const [fG, setFG] = useState<"male" | "female">("male");
  const [fEx, setFEx] = useState(false); const [fVeg, setFVeg] = useState(false); const [fBP, setFBP] = useState(false); const [fHist, setFHist] = useState(false);
  const [fFam, setFFam] = useState<"none" | "second-degree" | "first-degree">("none");

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-7 w-7 text-primary" />
            Health Calculators
          </h1>
          <p className="text-muted-foreground mt-1">
            Quick risk calculators and body metrics. For information only — talk to your doctor.
          </p>
        </div>

        <Tabs defaultValue="bmi" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 flex-wrap gap-1">
            <TabsTrigger value="bmi"><Scale className="h-4 w-4 mr-1" />BMI</TabsTrigger>
            <TabsTrigger value="bmr"><Droplet className="h-4 w-4 mr-1" />BMR</TabsTrigger>
            <TabsTrigger value="iw">Ideal Weight</TabsTrigger>
            <TabsTrigger value="ascvd"><Heart className="h-4 w-4 mr-1" />Heart Risk (ASCVD)</TabsTrigger>
            <TabsTrigger value="findrisc">Diabetes Risk (FINDRISC)</TabsTrigger>
          </TabsList>

          <TabsContent value="bmi">
            <Card>
              <CardHeader>
                <CardTitle>Body Mass Index</CardTitle>
                <CardDescription>Weight relative to height. A rough screen, not a diagnosis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" value={bmiH} onChange={e => setBmiH(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={bmiW} onChange={e => setBmiW(e.target.value)} /></div>
                </div>
                <Button onClick={() => setBmi(calcBmi(+bmiW, +bmiH))} disabled={!bmiH || !bmiW}>Calculate</Button>
                <ResultBox r={bmi} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bmr">
            <Card>
              <CardHeader>
                <CardTitle>Basal Metabolic Rate</CardTitle>
                <CardDescription>Calories you burn at complete rest (Mifflin-St Jeor).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={bmrW} onChange={e => setBmrW(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" value={bmrH} onChange={e => setBmrH(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Age</Label><Input type="number" value={bmrA} onChange={e => setBmrA(e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={bmrG} onValueChange={v => setBmrG(v as "male" | "female")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => setBmr(calcBmr(+bmrW, +bmrH, +bmrA, bmrG))} disabled={!bmrW || !bmrH || !bmrA}>Calculate</Button>
                <ResultBox r={bmr} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iw">
            <Card>
              <CardHeader>
                <CardTitle>Ideal Weight</CardTitle>
                <CardDescription>Devine formula. Use as rough reference only.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" value={iwH} onChange={e => setIwH(e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={iwG} onValueChange={v => setIwG(v as "male" | "female")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => setIw(calcIdealWeight(+iwH, iwG))} disabled={!iwH}>Calculate</Button>
                <ResultBox r={iw} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ascvd">
            <Card>
              <CardHeader>
                <CardTitle>10-Year Heart Disease Risk (ASCVD)</CardTitle>
                <CardDescription>ACC/AHA Pooled Cohort Equations. Best for ages 40–79.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Age</Label><Input type="number" value={aAge} onChange={e => setAAge(e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={aGender} onValueChange={v => setAGender(v as "male" | "female")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Total cholesterol</Label><Input type="number" value={aTC} onChange={e => setATC(e.target.value)} /></div>
                  <div className="space-y-2"><Label>HDL</Label><Input type="number" value={aHDL} onChange={e => setAHDL(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Systolic BP</Label><Input type="number" value={aSBP} onChange={e => setASBP(e.target.value)} /></div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2"><Switch checked={aSmoker} onCheckedChange={setASmoker} />Current smoker</label>
                  <label className="flex items-center gap-2"><Switch checked={aDM} onCheckedChange={setADM} />Diabetic</label>
                  <label className="flex items-center gap-2"><Switch checked={aBPT} onCheckedChange={setABPT} />On BP medication</label>
                </div>
                <Button onClick={() => setAscvd(calcAscvd({
                  age: +aAge, gender: aGender, totalCholesterol: +aTC, hdl: +aHDL, systolicBP: +aSBP,
                  smoker: aSmoker, diabetic: aDM, bpTreated: aBPT,
                }))} disabled={!aAge || !aTC || !aHDL || !aSBP}>Calculate</Button>
                <ResultBox r={ascvd} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findrisc">
            <Card>
              <CardHeader>
                <CardTitle>10-Year Type 2 Diabetes Risk (FINDRISC)</CardTitle>
                <CardDescription>Validated Finnish Diabetes Risk Score.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Age</Label><Input type="number" value={fAge} onChange={e => setFAge(e.target.value)} /></div>
                  <div className="space-y-2"><Label>BMI</Label><Input type="number" step="0.1" value={fBmi} onChange={e => setFBmi(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Waist (cm)</Label><Input type="number" value={fWaist} onChange={e => setFWaist(e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={fG} onValueChange={v => setFG(v as "male" | "female")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Family with diabetes?</Label>
                    <Select value={fFam} onValueChange={v => setFFam(v as typeof fFam)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No</SelectItem>
                        <SelectItem value="second-degree">Grandparent / aunt / uncle / cousin</SelectItem>
                        <SelectItem value="first-degree">Parent / sibling / child</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2"><Switch checked={fEx} onCheckedChange={setFEx} />30+ min activity daily</label>
                  <label className="flex items-center gap-2"><Switch checked={fVeg} onCheckedChange={setFVeg} />Vegetables/fruit daily</label>
                  <label className="flex items-center gap-2"><Switch checked={fBP} onCheckedChange={setFBP} />On BP medication</label>
                  <label className="flex items-center gap-2"><Switch checked={fHist} onCheckedChange={setFHist} />Past high glucose reading</label>
                </div>
                <Button onClick={() => setFind(calcFindrisc({
                  age: +fAge, bmi: +fBmi, waistCm: +fWaist, gender: fG,
                  exercise30minDaily: fEx, veggiesDaily: fVeg, bpMeds: fBP,
                  highGlucoseHistory: fHist, familyDiabetes: fFam,
                }))} disabled={!fAge || !fBmi || !fWaist}>Calculate</Button>
                <ResultBox r={find} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
