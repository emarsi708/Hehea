import { AnalysisResult } from "./types";
import { format } from "date-fns";

export function exportToHtml(report: AnalysisResult): string {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'color: #dc2626; background: #fee2e2; border-color: #fca5a5;';
      case 'warning': return 'color: #d97706; background: #fef3c7; border-color: #fcd34d;';
      case 'watch': return 'color: #2563eb; background: #dbeafe; border-color: #93c5fd;';
      default: return 'color: #0d9488; background: #ccfbf1; border-color: #5eead4;';
    }
  };

  const flagsHtml = report.flags.length > 0 
    ? report.flags.map(f => `
      <div style="padding: 16px; margin-bottom: 12px; border-radius: 8px; border: 1px solid; ${getSeverityColor(f.severity)}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="margin: 0; font-size: 16px;">${f.metric}</h4>
          <div>
            <span style="font-weight: bold; text-transform: uppercase; font-size: 12px; margin-right: 8px;">${f.status}</span>
            <span style="font-family: monospace; background: rgba(255,255,255,0.5); padding: 2px 6px; border-radius: 4px; font-size: 14px;">${f.value} ${f.unit}</span>
          </div>
        </div>
        <p style="margin: 0; font-size: 14px; line-height: 1.5;">${f.explanation}</p>
      </div>
    `).join('')
    : '<p>No abnormal values found. Great job!</p>';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Report - ${format(new Date(report.date), "MMM d, yyyy")}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 { color: #111827; margin: 0 0 8px 0; }
    h2 { color: #374151; margin-top: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    h3 { color: #4b5563; margin-bottom: 8px; }
    .summary-box {
      background: #f0fdf4;
      border: 1px solid #ccfbf1;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 32px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .disclaimer {
      margin-top: 40px;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 8px;
      font-size: 12px;
      color: #6b7280;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; padding: 0; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HealthAdvisor Analysis Report</h1>
      <p style="color: #6b7280; margin: 0;">Generated on ${format(new Date(report.date), "MMMM d, yyyy")}</p>
    </div>

    <div class="summary-box">
      <h3>Summary</h3>
      <p style="font-size: 16px;">${report.summary}</p>
      <div style="margin-top: 16px; font-weight: bold;">
        BMI: ${report.bmi.value} (${report.bmi.category})
      </div>
    </div>

    <h2>Areas to Monitor</h2>
    ${flagsHtml}

    <div class="page-break"></div>

    <h2>Nutrition Strategy</h2>
    <div class="card">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 16px;">
        <div>
          <strong style="display: block; color: #6b7280; font-size: 14px;">Daily Target</strong>
          <span style="font-size: 24px; font-weight: bold;">${report.diet.dailyCaloriesTarget} kcal</span>
        </div>
        <div style="text-align: right;">
          <strong style="display: block; color: #6b7280; font-size: 14px;">Macros</strong>
          <span>${report.diet.macroSplit.protein}% P / ${report.diet.macroSplit.carbs}% C / ${report.diet.macroSplit.fat}% F</span>
        </div>
      </div>
      <div class="grid-2">
        <div>
          <h4 style="color: #0d9488; margin-top: 0;">Focus On</h4>
          <ul style="margin:0; padding-left: 20px;">
            ${report.diet.foodsToEat.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h4 style="color: #dc2626; margin-top: 0;">Limit / Avoid</h4>
          <ul style="margin:0; padding-left: 20px;">
            ${[...report.diet.foodsToLimit, ...report.diet.foodsToAvoid].map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <h2>Lifestyle & Movement</h2>
    <div class="grid-2">
      <div class="card">
        <h4 style="margin-top: 0;">Exercise Plan</h4>
        <p><strong>Target:</strong> ${report.exercise.weeklyMinutes} min/week (${report.exercise.intensity})</p>
        <p><strong>Activities:</strong> ${report.exercise.suggestedActivities.join(", ")}</p>
      </div>
      <div class="card">
        <h4 style="margin-top: 0;">Hydration</h4>
        <p><strong>Target:</strong> ${report.hydration.dailyMl / 1000} L/day (~${report.hydration.dailyGlasses} glasses)</p>
        <ul style="margin:0; padding-left: 20px; font-size: 14px;">
          ${report.hydration.tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
    </div>

    <h2>Next Steps</h2>
    <div class="card">
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${report.followUp.map(f => `
          <li style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
            <strong style="display: block; font-size: 16px;">${f.test}</strong>
            <span style="color: #0d9488; font-weight: 500;">${f.when}</span>
            <p style="margin: 4px 0 0 0; color: #4b5563; font-size: 14px;">${f.why}</p>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="disclaimer">
      <strong>Disclaimer:</strong> This tool provides general wellness information based on common reference ranges. It is not medical advice and is not a substitute for consultation, diagnosis, or treatment by a qualified healthcare professional. Always consult your doctor before making changes to your diet, exercise, or medication.
    </div>
  </div>
</body>
</html>
  `;
  return html;
}
