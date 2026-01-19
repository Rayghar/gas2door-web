// lib/money.ts
export function formatNaira(amount: number) {
  if (!Number.isFinite(amount)) return "₦0";
  return "₦" + Math.round(amount).toLocaleString("en-NG");
}

/**
 * pricePerKg = totalPrice / kg
 * Example: 12.5kg for ₦13,750 => ₦1,100/kg
 */
export function pricePerKg(totalPrice: number, kg: number) {
  if (!Number.isFinite(totalPrice) || !Number.isFinite(kg) || kg <= 0) return 0;
  return totalPrice / kg;
}

export function formatNairaPerKg(totalPrice: number, kg: number) {
  const v = pricePerKg(totalPrice, kg);
  return v ? `${formatNaira(v)}/kg` : "₦0/kg";
}
