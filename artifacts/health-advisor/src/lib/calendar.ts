function pad(n: number) { return n.toString().padStart(2, "0"); }
function toICSDate(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

export interface ReminderEvent {
  title: string;
  description: string;
  weeksFromNow: number;
}

export function buildReminderICS(events: ReminderEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HealthAdvisor//Reminders//EN",
    "CALSCALE:GREGORIAN",
  ];

  events.forEach((ev, i) => {
    const start = new Date();
    start.setDate(start.getDate() + ev.weeksFromNow * 7);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${Date.now()}-${i}@healthadvisor`,
      `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${ev.title.replace(/[\n,;]/g, " ")}`,
      `DESCRIPTION:${ev.description.replace(/[\n,;]/g, " ")}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${ev.title.replace(/[\n,;]/g, " ")}`,
      "END:VALARM",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
