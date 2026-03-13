import { slugify } from "@/lib/utils";

export type ParsedImportRow = {
  title: string;
  price: number;
  inStock: boolean;
};

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseMoney(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const amount = Number.parseFloat(cleaned);
  return Number.isFinite(amount) ? amount : 0;
}

function parseStock(value: string) {
  const match = value.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

export function parseProkipProductsCsv(raw: string): ParsedImportRow[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const headerIndex = lines.findIndex((line) => line === "Product/Service,Selling Price");
  if (headerIndex === -1) {
    throw new Error('Expected a CSV with exactly this header: "Product/Service,Selling Price".');
  }

  const rows = lines.slice(headerIndex + 1);
  const seen = new Set<string>();
  const parsed: ParsedImportRow[] = [];

  for (const row of rows) {
    const cells = parseCsvLine(row);
    const title = cells[0]?.trim();
    const price = parseMoney(cells[1] ?? "");

    if (!title || !price) continue;

    const dedupeKey = `${slugify(title)}:${price}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    parsed.push({
      title,
      price,
      inStock: true,
    });
  }

  return parsed;
}
