import type { Category } from "./types";

export const categories: Category[] = [
  { id: "housekeeping", label: "Maid & Housekeeping", icon: "home", wageRange: "₹350 – ₹600 / day" },
  { id: "cook", label: "Cook", icon: "cooking-pot", wageRange: "₹400 – ₹700 / day" },
  { id: "driver", label: "Driver", icon: "car", wageRange: "₹500 – ₹900 / day" },
  { id: "electrician", label: "Electrician", icon: "zap", wageRange: "₹450 – ₹800 / visit" },
  { id: "plumber", label: "Plumber", icon: "wrench", wageRange: "₹400 – ₹750 / visit" },
  { id: "security", label: "Security Guard", icon: "shield", wageRange: "₹450 – ₹700 / shift" },
  { id: "delivery", label: "Delivery", icon: "package", wageRange: "₹350 – ₹600 / day" },
  { id: "construction", label: "Construction Labour", icon: "hard-hat", wageRange: "₹450 – ₹800 / day" },
  { id: "childcare", label: "Babysitter & Elder Care", icon: "heart-handshake", wageRange: "₹400 – ₹700 / day" },
  { id: "gardener", label: "Gardener", icon: "sprout", wageRange: "₹350 – ₹600 / day" },
  { id: "painter", label: "Painter", icon: "paint-roller", wageRange: "₹500 – ₹900 / day" },
  { id: "carpenter", label: "Carpenter", icon: "hammer", wageRange: "₹500 – ₹900 / day" },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
