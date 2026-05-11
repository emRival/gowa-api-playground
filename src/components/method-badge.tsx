import { Badge } from "@/components/ui/badge";
import type { HttpMethod } from "@/lib/api-definitions";

const methodStyles: Record<HttpMethod, string> = {
  GET: "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]",
  POST: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(34,197,94,0.15)]",
  DELETE:
    "bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]",
};

export function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-md px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider ${methodStyles[method]}`}
    >
      {method}
    </Badge>
  );
}
