import { NavLink, Route, Routes } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Target,
  Landmark,
  GraduationCap,
  Wallet,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import ScenarioSimulator from "./pages/ScenarioSimulator";
import LifestyleGoal from "./pages/LifestyleGoal";
import DebtPayoff from "./pages/DebtPayoff";
import Education from "./pages/Education";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/scenarios", label: "Scenario Simulator", icon: Sparkles, end: false },
  { to: "/lifestyle", label: "Lifestyle Goal", icon: Target, end: false },
  { to: "/debt-payoff", label: "Debt Payoff", icon: Landmark, end: false },
  { to: "/learn", label: "Learn", icon: GraduationCap, end: false },
];

export default function App() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="shrink-0 border-b border-slate-800 bg-slate-950/80 md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-6 py-5">
          <Wallet className="h-5 w-5 text-brand-500" />
          <span className="text-lg font-bold tracking-tight text-white">Ledger</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-6">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500/15 text-brand-400"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-3xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scenarios" element={<ScenarioSimulator />} />
            <Route path="/lifestyle" element={<LifestyleGoal />} />
            <Route path="/debt-payoff" element={<DebtPayoff />} />
            <Route path="/learn" element={<Education />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
