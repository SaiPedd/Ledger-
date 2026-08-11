const BASE = "/api";

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getTransactions: () => request("/transactions"),
  addTransaction: (data: unknown) =>
    request("/transactions", { method: "POST", body: JSON.stringify(data) }),
  deleteTransaction: (id: number) =>
    request(`/transactions/${id}`, { method: "DELETE" }),
  getSpendByCategory: () => request("/transactions/summary/by-category"),

  getScenarios: () => request("/scenarios"),
  createScenario: (data: unknown) =>
    request("/scenarios", { method: "POST", body: JSON.stringify(data) }),
  getScenario: (id: number) => request(`/scenarios/${id}`),

  getLifestyleGoals: () => request("/lifestyle-goals"),
  createLifestyleGoal: (data: unknown) =>
    request("/lifestyle-goals", { method: "POST", body: JSON.stringify(data) }),

  getDebts: () => request("/debts"),
  addDebt: (data: unknown) =>
    request("/debts", { method: "POST", body: JSON.stringify(data) }),
  deleteDebt: (id: number) => request(`/debts/${id}`, { method: "DELETE" }),
  getPayoffPlan: (data: unknown) =>
    request("/debts/payoff-plan", { method: "POST", body: JSON.stringify(data) }),

  getEducationModules: () => request("/education"),
};
