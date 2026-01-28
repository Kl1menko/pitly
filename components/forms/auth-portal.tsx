"use client";

import { useState } from "react";
import { AuthMultichannel } from "@/components/forms/auth-multichannel";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export function AuthPortal({ defaultMode = "login" }: { defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);

  return (
    <div className="space-y-5">
      <div className="flex rounded-full bg-neutral-100 p-1 text-sm font-semibold">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-full px-4 py-2 transition",
              mode === m ? "bg-neutral-900 text-white" : "text-neutral-700"
            )}
          >
            {m === "login" ? "Увійти" : "Зареєструватися"}
          </button>
        ))}
      </div>

      <AuthMultichannel mode={mode} role="client" />
    </div>
  );
}
