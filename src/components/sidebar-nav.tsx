"use client";

import { useState } from "react";
import { API_CATEGORIES } from "@/lib/api-definitions";
import { MethodBadge } from "@/components/method-badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  MessageSquare,
  Users,
  ChevronRight,
  Menu,
  Zap,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="size-4" />,
  MessageSquare: <MessageSquare className="size-4" />,
  Users: <Users className="size-4" />,
};

interface SidebarNavProps {
  activeEndpoint?: string;
  onEndpointClick: (id: string) => void;
}

function SidebarContent({
  activeEndpoint,
  onEndpointClick,
}: SidebarNavProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(API_CATEGORIES.map((c) => [c.id, true]))
  );

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border/40 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg overflow-hidden bg-emerald-50/50 ring-1 ring-border/50">
          <img 
            src="/gowa-logo.svg" 
            alt="GoWA Logo" 
            className="size-7 object-contain"
          />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground">
            GoWA
          </h1>
          <p className="text-[10px] text-muted-foreground">
            API Playground
          </p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">
          {API_CATEGORIES.map((category) => (
            <Collapsible
              key={category.id}
              open={openCategories[category.id]}
              onOpenChange={(open) =>
                setOpenCategories((prev) => ({ ...prev, [category.id]: open }))
              }
            >
              <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground">
                {categoryIcons[category.icon]}
                <span className="flex-1 text-left">{category.label}</span>
                <ChevronRight
                  className={`size-3.5 transition-transform duration-200 ${
                    openCategories[category.id] ? "rotate-90" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-3 flex flex-col gap-0.5 border-l border-border/40 pl-3 pt-1">
                  {category.endpoints.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => onEndpointClick(ep.id)}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-all duration-150 ${
                        activeEndpoint === ep.id
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                      }`}
                    >
                      <MethodBadge method={ep.method} />
                      <span className="truncate text-[11px]">{ep.name}</span>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 px-5 py-4 flex flex-col gap-1.5">
        <p className="text-[10px] text-muted-foreground leading-tight font-medium">
          GoWA API Playground v1.0
        </p>
        <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
          <span>Built with AI by</span>
          <a 
            href="https://instagram.com/em_rival" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-emerald-500/80 transition-colors hover:text-emerald-400 hover:underline"
          >
            @em_rival
          </a>
        </p>
      </div>
    </div>
  );
}

export function SidebarNav({ activeEndpoint, onEndpointClick }: SidebarNavProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleClick = (id: string) => {
    onEndpointClick(id);
    setSheetOpen(false);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:h-full lg:w-72 lg:flex-col lg:border-r lg:border-border/40 lg:bg-[var(--sidebar-bg)]">
        <SidebarContent
          activeEndpoint={activeEndpoint}
          onEndpointClick={onEndpointClick}
        />
      </aside>

      {/* Mobile hamburger */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                size="lg"
                className="size-14 rounded-full bg-emerald-600 text-white shadow-2xl shadow-emerald-900/40 hover:bg-emerald-500"
              />
            }
          >
            <Menu className="size-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-[var(--sidebar-bg)]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent
              activeEndpoint={activeEndpoint}
              onEndpointClick={handleClick}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
