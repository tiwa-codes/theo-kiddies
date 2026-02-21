import { Users } from "lucide-react";

export default function AdminCustomersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your customer base.</p>
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
        <Users className="h-10 w-10 text-gray-300" />
        <p className="mt-4 font-semibold text-gray-500">No customer data yet</p>
        <p className="mt-1 max-w-sm text-sm text-gray-400">
          Connect an authentication provider (NextAuth, Clerk, Supabase Auth) to start tracking
          your customers here.
        </p>
      </div>
    </div>
  );
}
