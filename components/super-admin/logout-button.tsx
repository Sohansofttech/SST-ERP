import { LogOut } from "lucide-react";
import { signOut } from "@/lib/super-admin/session-actions";

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action={signOut}>
      <button className={`sa-logout-form-button ${className}`} type="submit" aria-label="Sign out">
        <LogOut size={16} /><span>Sign out</span>
      </button>
    </form>
  );
}
