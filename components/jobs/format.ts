import type { Currency } from "@/content/jobs";

/*
  Indian grouping for rupees (₹1,49,999 rather than ₹149,999 once prices ever
  reach a lakh), US grouping for dollars. No decimals: every price is whole.
*/
const formatters: Record<Currency, Intl.NumberFormat> = {
  INR: new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }),
};

export function formatPrice(amount: number, currency: Currency): string {
  return formatters[currency].format(amount);
}
