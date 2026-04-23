import { DayPlan } from "./wellnessPlan";

export interface GroceryItem {
  name: string;
  aisle: string;
  count: number;
}

const AISLE_MAP: Array<{ aisle: string; keywords: string[] }> = [
  { aisle: "Produce", keywords: ["spinach", "broccoli", "salad", "vegetables", "veggies", "tomato", "cucumber", "carrot", "bell pepper", "greens", "leafy", "berries", "apple", "banana", "orange", "lemon", "lime", "avocado", "fruit", "sweet potato", "potato", "cabbage", "cauliflower", "ginger", "garlic", "onion", "mushroom", "celery", "lettuce", "kale", "zucchini", "asparagus", "pumpkin", "papaya", "mango", "grapes", "watermelon", "pomegranate"] },
  { aisle: "Protein / Meat / Fish", keywords: ["chicken", "fish", "salmon", "tuna", "egg", "eggs", "turkey", "lean protein", "shrimp"] },
  { aisle: "Dairy & Alternatives", keywords: ["yogurt", "milk", "paneer", "cheese", "tofu", "greek yogurt", "cottage cheese"] },
  { aisle: "Grains & Pantry", keywords: ["oats", "oatmeal", "quinoa", "brown rice", "whole grain", "whole-grain", "bread", "toast", "porridge", "chapati", "wrap", "cereal", "rice"] },
  { aisle: "Legumes & Beans", keywords: ["lentil", "dal", "beans", "chickpea", "khichdi", "mixed bean"] },
  { aisle: "Nuts, Seeds & Oils", keywords: ["walnut", "almond", "almonds", "chia", "flaxseed", "olive oil", "seeds", "peanut", "cashew", "sunflower", "pumpkin seed"] },
  { aisle: "Beverages", keywords: ["coconut water", "smoothie", "tea", "coffee", "water"] },
  { aisle: "Spices & Condiments", keywords: ["cinnamon", "salt", "pepper", "spice", "raita", "dressing", "sauce"] },
];

const STOP_WORDS = new Set([
  "with", "and", "or", "of", "the", "a", "an", "in", "on", "to", "small", "large",
  "side", "sautéed", "sauteed", "grilled", "steamed", "baked", "boiled", "stir",
  "stir-fried", "fried", "roast", "roasted", "mixed", "fresh", "few", "less",
  "portion", "scramble", "stew", "soup", "bowl", "parfait", "plus", "+", "/",
]);

function findAisle(item: string): string {
  const lower = item.toLowerCase();
  for (const { aisle, keywords } of AISLE_MAP) {
    if (keywords.some(k => lower.includes(k))) return aisle;
  }
  return "Other";
}

function extractItems(text: string): string[] {
  const cleaned = text
    .replace(/\([^)]*\)/g, "")
    .replace(/[+/]/g, ",")
    .replace(/\sor\s/gi, ",")
    .replace(/\sand\s/gi, ",")
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(Boolean);

  const items = new Set<string>();
  for (const seg of cleaned) {
    const words = seg.split(/\s+/).filter(w => !STOP_WORDS.has(w.toLowerCase()) && w.length > 2);
    if (words.length === 0) continue;
    const phrase = words.join(" ").replace(/[.,!?]$/, "").trim();
    if (phrase.length < 3) continue;
    items.add(phrase.toLowerCase());
  }
  return Array.from(items);
}

export function buildGroceryList(plan: DayPlan[]): Record<string, GroceryItem[]> {
  const counts = new Map<string, number>();
  plan.forEach(d => {
    [d.meals.breakfast, d.meals.lunch, d.meals.dinner, d.meals.snack].forEach(meal => {
      extractItems(meal).forEach(item => {
        counts.set(item, (counts.get(item) ?? 0) + 1);
      });
    });
  });

  const grouped: Record<string, GroceryItem[]> = {};
  for (const [name, count] of counts.entries()) {
    const display = name.replace(/\b\w/g, c => c.toUpperCase());
    const aisle = findAisle(name);
    grouped[aisle] = grouped[aisle] ?? [];
    grouped[aisle].push({ name: display, aisle, count });
  }

  Object.values(grouped).forEach(items => items.sort((a, b) => b.count - a.count));
  return grouped;
}
