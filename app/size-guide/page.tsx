import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Size Guide – Theo Kiddies",
  description: "Children's clothing and shoe size guide at Theo Kiddies.",
};

const clothingSizes = [
  { size: "XS", age: "0–6 months", height: "60–68 cm", weight: "4–8 kg" },
  { size: "S", age: "6–12 months", height: "68–76 cm", weight: "8–10 kg" },
  { size: "M", age: "1–2 years", height: "76–92 cm", weight: "10–13 kg" },
  { size: "L", age: "2–3 years", height: "92–98 cm", weight: "13–15 kg" },
  { size: "XL", age: "3–4 years", height: "98–104 cm", weight: "15–17 kg" },
  { size: "2XL", age: "4–5 years", height: "104–110 cm", weight: "17–19 kg" },
  { size: "3XL", age: "5–6 years", height: "110–116 cm", weight: "19–21 kg" },
];

const shoeSizes = [
  { ngSize: "16", ukSize: "0.5", euSize: "16", ageGuide: "0–3 months" },
  { ngSize: "18", ukSize: "2", euSize: "18", ageGuide: "3–6 months" },
  { ngSize: "20", ukSize: "3.5", euSize: "20", ageGuide: "6–9 months" },
  { ngSize: "22", ukSize: "5", euSize: "22", ageGuide: "1 year" },
  { ngSize: "24", ukSize: "7", euSize: "24", ageGuide: "18 months" },
  { ngSize: "26", ukSize: "8.5", euSize: "26", ageGuide: "2 years" },
  { ngSize: "28", ukSize: "10", euSize: "28", ageGuide: "3 years" },
  { ngSize: "30", ukSize: "11.5", euSize: "30", ageGuide: "4–5 years" },
];

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-brand-cream py-14">
      <Container>
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            Sizing
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Size Guide</h1>
          <p className="mt-3 max-w-xl text-sm text-brand-cocoa/70">
            All sizes are approximate. When between sizes, we recommend sizing up for comfort and room to grow.
          </p>
        </div>

        <div className="max-w-3xl space-y-8">
          {/* Clothing */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Clothing Sizes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3">Age</th>
                    <th className="px-6 py-3">Height</th>
                    <th className="px-6 py-3">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clothingSizes.map(({ size, age, height, weight }) => (
                    <tr key={size}>
                      <td className="px-6 py-4 font-semibold text-brand-orange">{size}</td>
                      <td className="px-6 py-4 text-brand-cocoa">{age}</td>
                      <td className="px-6 py-4 text-brand-cocoa/70">{height}</td>
                      <td className="px-6 py-4 text-brand-cocoa/70">{weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shoes */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Shoe Sizes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-3">NG/EU Size</th>
                    <th className="px-6 py-3">UK Size</th>
                    <th className="px-6 py-3">EU Size</th>
                    <th className="px-6 py-3">Age Guide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shoeSizes.map(({ ngSize, ukSize, euSize, ageGuide }) => (
                    <tr key={ngSize}>
                      <td className="px-6 py-4 font-semibold text-brand-orange">{ngSize}</td>
                      <td className="px-6 py-4 text-brand-cocoa/70">{ukSize}</td>
                      <td className="px-6 py-4 text-brand-cocoa/70">{euSize}</td>
                      <td className="px-6 py-4 text-brand-cocoa">{ageGuide}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-brand-cocoa/50">
            Not sure? Message us on WhatsApp with your child&apos;s measurements and we&apos;ll recommend the right size.
          </p>
        </div>
      </Container>
    </div>
  );
}
