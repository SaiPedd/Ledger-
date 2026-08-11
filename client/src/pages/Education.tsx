import { useEffect, useState } from "react";
import { api } from "../api/client";
import Card from "../components/Card";

interface Module {
  id: string;
  title: string;
  summary: string;
}

export default function Education() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEducationModules().then((m) => {
      setModules(m);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Learn</h1>
        <p className="mt-1 text-sm text-slate-400">General education only — not personalized financial advice.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-4">
          {modules.map((m) => (
            <Card key={m.id} title={m.title}>
              <p className="text-sm text-slate-400">{m.summary}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
