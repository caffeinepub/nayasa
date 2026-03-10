/**
 * Format number in Indian number system with ₹ prefix
 * e.g. 134900 => ₹1,34,900
 */
export function formatINR(amount: number | bigint): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  const str = num.toString();
  const lastThree = str.slice(-3);
  const rest = str.slice(0, str.length - 3);
  let result = "";
  if (rest !== "") {
    let i = rest.length;
    while (i > 0) {
      const chunk = rest.slice(Math.max(0, i - 2), i);
      result = chunk + (result ? `,${result}` : "");
      i -= 2;
    }
    result = `${result},${lastThree}`;
  } else {
    result = lastThree;
  }
  return `\u20B9${result}`;
}

/**
 * Calculate health score from battery health and diagnostic results
 */
export function calcHealthScore(
  batteryHealth: bigint,
  diagnosticResults: string[],
): number {
  const battery = Number(batteryHealth);
  const passCount = diagnosticResults.filter((r) => r === "Pass").length;
  const diagScore =
    diagnosticResults.length > 0
      ? (passCount / diagnosticResults.length) * 100
      : 100;
  return Math.round(battery * 0.4 + diagScore * 0.6);
}

/**
 * Get brand gradient CSS class
 */
export function brandGradient(brand: string): string {
  const b = brand.toLowerCase();
  if (b === "apple") return "phone-gradient-apple";
  if (b === "samsung") return "phone-gradient-samsung";
  if (b === "oneplus") return "phone-gradient-oneplus";
  if (b === "google") return "phone-gradient-google";
  if (b === "xiaomi") return "phone-gradient-xiaomi";
  return "phone-gradient-default";
}

/**
 * Get condition badge color classes
 */
export function conditionColors(condition: string): {
  bg: string;
  text: string;
} {
  const c = condition.toLowerCase();
  if (c === "mint") return { bg: "bg-primary/10", text: "text-primary" };
  if (c === "excellent") return { bg: "bg-blue-500/10", text: "text-blue-400" };
  if (c === "good") return { bg: "bg-yellow-500/10", text: "text-yellow-400" };
  return { bg: "bg-muted", text: "text-muted-foreground" };
}
