import { announcement } from "@/lib/data";

export function AnnouncementBar() {
  return (
    <div className="bg-brand-orange text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]">
        {announcement}
      </div>
    </div>
  );
}
