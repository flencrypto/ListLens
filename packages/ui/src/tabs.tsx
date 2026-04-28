import * as React from "react";
import { cn } from "./cn";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  /** Stable id prefix used to wire trigger ↔ panel via aria-controls/labelledby. */
  baseId: string;
}
const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponent must be used within <Tabs />");
  return ctx;
}

/** Build deterministic ids so server and client render the same markup. */
function getTriggerId(baseId: string, value: string) {
  return `${baseId}-trigger-${value}`;
}
function getPanelId(baseId: string, value: string) {
  return `${baseId}-panel-${value}`;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Optional explicit id; otherwise a stable React-generated id is used. */
  id?: string;
}

export function Tabs({ defaultValue, value, onValueChange, className, children, id, ...props }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const reactId = React.useId();
  const baseId = id ?? `tabs-${reactId}`;
  const active = value ?? internal;
  const setActive = (tab: string) => {
    setInternal(tab);
    onValueChange?.(tab);
  };
  return (
    <TabsContext.Provider value={{ activeTab: active, setActiveTab: setActive, baseId }}>
      <div className={cn("", className)} id={id} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="tablist" className={cn("inline-flex rounded-lg bg-white/5 p-1 gap-1", className)} {...props} />
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, onClick, onKeyDown, ...props }: TabsTriggerProps) {
  const { activeTab, setActiveTab, baseId } = useTabs();
  const isActive = activeTab === value;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    const list = event.currentTarget.closest('[role="tablist"]');
    if (!list) return;
    const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    if (tabs.length === 0) return;
    const currentIndex = tabs.indexOf(event.currentTarget);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    event.preventDefault();
    const next = tabs[nextIndex];
    next.focus();
    const nextValue = next.getAttribute("data-value");
    if (nextValue) setActiveTab(nextValue);
  };
  return (
    <button
      role="tab"
      id={getTriggerId(baseId, value)}
      aria-selected={isActive}
      aria-controls={getPanelId(baseId, value)}
      tabIndex={isActive ? 0 : -1}
      data-value={value}
      type="button"
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
        isActive ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80",
        className
      )}
      onClick={(event) => {
        // Compose with a caller-provided onClick so spreading {...props} can't
        // override the tab-switch handler.
        onClick?.(event);
        if (!event.defaultPrevented) setActiveTab(value);
      }}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, id, ...props }: TabsContentProps) {
  const { activeTab, baseId } = useTabs();
  if (activeTab !== value) return null;
  return (
    <div
      role="tabpanel"
      id={id ?? getPanelId(baseId, value)}
      aria-labelledby={getTriggerId(baseId, value)}
      tabIndex={0}
      className={cn("mt-4", className)}
      {...props}
    />
  );
}
