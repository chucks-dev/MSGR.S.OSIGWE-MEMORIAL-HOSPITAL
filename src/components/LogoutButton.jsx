"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendAction } from "@/lib/client";

export default function LogoutButton({ endpoint = "/api/auth/logout", className = "btn btn-outline btn-sm" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    const res = await sendAction(endpoint, "POST");
    setBusy(false);
    router.push(res.data?.redirect || "/");
    router.refresh();
  }

  return (
    <button type="button" className={className} onClick={onClick} disabled={busy}>
      {busy ? "Logging out…" : "Logout"}
    </button>
  );
}
