import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Navbar } from "@/components/layout/Navbar";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { inputSchema, HealthInputs, conditionsEnum } from "@/lib/types";
import { analyzeHealthData } from "@/lib/analyzer";
import { useHealthReport } from "@/hooks/use-health-report";
import { Loader2, Activity } from "lucide-react";

const SAMPLE_DATA: HealthInputs = {
  age: 45,
  gender: "male",
  height: 178,
  weight: 86,
  conditions: ["Hypertension"],
  activityLevel: "light",
  dietaryPreference: "omnivore",
  fastingGlucose: 108,
  hba1c: 5.9,
  totalCholesterol: 215,
  ldl: 145,
  hdl: 38,
  triglycerides: 160,
  tsh: 2.5,
  alt: 45,
  ast: 35,
  creatinine: 1.1,
  hemoglobin: 14.2,
};

export default function InputForm() {
  const [, setLocation] = useLocation();
  const { setReport, lastInputs } = useHealthReport();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm<HealthInputs>({
    resolver: zodResolver(inputSchema),
    defaultValues: lastInputs || {
      conditions: [],
    },
  });

  const onSubmit = async (data: HealthInputs) => {
    setIsAnalyzing(true);
    // Simulate slight processing time for UX
    await new Promise(r => setTimeout(r, 800));
    
    const report = analyzeHealthData(data);
    setReport(data, report);
    
    setIsAnalyzing(false);
    setLocation("/results");
  };

  const loadSample = () => {
    form.reset(SAMPLE_DATA);
  };

  const clearAll = () => {
    form.reset({
      conditions: [],
      gender: undefined,
      activityLevel: undefined,
      dietaryPreference: undefined,
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pb-20">
      <Navbar />
      <DisclaimerBanner />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enter Your Results</h1>
            <p className="text-muted-foreground mt-1">Fill in the values from your lab report. Leave blank anything you don't have.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearAll}>Clear All</Button>
            <Button variant="secondary" onClick={loadSample}>Load Sample Data</Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 flex-wrap gap-1">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="sugar">Blood Sugar</TabsTrigger>
                <TabsTrigger value="lipids">Lipids</TabsTrigger>
                <TabsTrigger value="thyroid">Thyroid</TabsTrigger>
                <TabsTrigger value="liver">Liver</TabsTrigger>
                <TabsTrigger value="kidney">Kidney</TabsTrigger>
                <TabsTrigger value="cbc">CBC</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Profile</CardTitle>
                      <CardDescription>Helps tailor your lifestyle and dietary recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="age" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g. 45" {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="gender" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="height" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g. 175" {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="weight" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g. 75" {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="activityLevel" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="sedentary">Sedentary (Little/no exercise)</SelectItem>
                                <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                                <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                                <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="dietaryPreference" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dietary Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="omnivore">Omnivore (Anything)</SelectItem>
                                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                <SelectItem value="vegan">Vegan</SelectItem>
                                <SelectItem value="pescatarian">Pescatarian</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      
                      <FormField control={form.control} name="conditions" render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Existing Conditions</FormLabel>
                            <CardDescription>Select any known conditions.</CardDescription>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {conditionsEnum.options.map((condition) => (
                              <FormField
                                key={condition}
                                control={form.control}
                                name="conditions"
                                render={({ field }) => {
                                  const isSelected = field.value?.includes(condition) || false;
                                  return (
                                    <FormItem key={condition}>
                                      <FormControl>
                                        <div 
                                          className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition-colors ${
                                            isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                                          }`}
                                          onClick={() => {
                                            const current = field.value || [];
                                            if (condition === "None") {
                                              field.onChange(["None"]);
                                            } else {
                                              const withoutNone = current.filter(c => c !== "None");
                                              if (isSelected) {
                                                field.onChange(withoutNone.filter(c => c !== condition));
                                              } else {
                                                field.onChange([...withoutNone, condition]);
                                              }
                                            }
                                          }}
                                        >
                                          {condition}
                                        </div>
                                      </FormControl>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sugar">
                  <Card>
                    <CardHeader>
                      <CardTitle>Blood Sugar</CardTitle>
                      <CardDescription>Glucose and HbA1c levels.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="fastingGlucose" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fasting Glucose (mg/dL)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 90" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="postprandialGlucose" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postprandial Glucose (mg/dL)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 120" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="hba1c" render={({ field }) => (
                        <FormItem>
                          <FormLabel>HbA1c (%)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g. 5.4" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="lipids">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lipid Profile</CardTitle>
                      <CardDescription>Cholesterol and triglycerides.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="totalCholesterol" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Cholesterol (mg/dL)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 180" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="ldl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>LDL (mg/dL)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 100" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="hdl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>HDL (mg/dL)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 50" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="triglycerides" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Triglycerides (mg/dL)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 120" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="thyroid">
                  <Card>
                    <CardHeader>
                      <CardTitle>Thyroid</CardTitle>
                      <CardDescription>Thyroid function panel.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="tsh" render={({ field }) => (
                        <FormItem>
                          <FormLabel>TSH (mIU/L)</FormLabel>
                          <FormControl><Input type="number" step="0.01" placeholder="e.g. 2.0" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="t3" render={({ field }) => (
                        <FormItem>
                          <FormLabel>T3 (ng/dL)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 100" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="t4" render={({ field }) => (
                        <FormItem>
                          <FormLabel>T4 (µg/dL)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g. 8.0" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="liver">
                  <Card>
                    <CardHeader>
                      <CardTitle>Liver Function</CardTitle>
                      <CardDescription>Enzymes and bilirubin.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="alt" render={({ field }) => (
                        <FormItem>
                          <FormLabel>ALT/SGPT (U/L)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 20" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="ast" render={({ field }) => (
                        <FormItem>
                          <FormLabel>AST/SGOT (U/L)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 20" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="alp" render={({ field }) => (
                        <FormItem>
                          <FormLabel>ALP (U/L)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 70" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="bilirubin" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Bilirubin (mg/dL)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g. 0.8" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="kidney">
                  <Card>
                    <CardHeader>
                      <CardTitle>Kidney Function</CardTitle>
                      <CardDescription>Creatinine, urea, uric acid.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="creatinine" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creatinine (mg/dL)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g. 0.9" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="urea" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urea (mg/dL)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 30" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="uricAcid" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Uric Acid (mg/dL)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g. 5.0" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="cbc">
                  <Card>
                    <CardHeader>
                      <CardTitle>Complete Blood Count (CBC)</CardTitle>
                      <CardDescription>Red/white blood cells and platelets.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="hemoglobin" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hemoglobin (g/dL)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g. 14.0" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="wbc" render={({ field }) => (
                        <FormItem>
                          <FormLabel>WBC (×10³/µL)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g. 6.0" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="platelets" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platelets (×10³/µL)</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 250" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="rbc" render={({ field }) => (
                        <FormItem>
                          <FormLabel>RBC (×10⁶/µL)</FormLabel>
                          <FormControl><Input type="number" step="0.1" placeholder="e.g. 4.5" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-40">
              <div className="container mx-auto max-w-4xl flex justify-end">
                <Button type="submit" size="lg" className="px-8 shadow-md" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Activity className="mr-2 h-5 w-5" />
                      Analyze Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
