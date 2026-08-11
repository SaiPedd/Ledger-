import { Router } from "express";

const router = Router();

// Static, general-education content only — deliberately NOT personalized
// eligibility/advice, to keep this a simple, safe student project rather
// than something that edges into regulated financial-advice territory.
const MODULES = [
  {
    id: "credit-basics",
    title: "Credit Scores, Simply",
    summary:
      "What a credit score is, the main factors that influence it (payment history, utilization, length of history), and why building credit early matters.",
  },
  {
    id: "budgeting-rules",
    title: "Budgeting Rules of Thumb",
    summary:
      "Common frameworks like the 50/30/20 rule, and how to adapt them to irregular student income (internship stipend vs. school-year income).",
  },
  {
    id: "investing-basics",
    title: "Investing Basics",
    summary:
      "What index funds are, why time horizon matters, and the general relationship between risk and return — general education, not a recommendation.",
  },
  {
    id: "credit-cards-101",
    title: "Credit Cards: Perks vs. Pitfalls",
    summary:
      "How rewards and perks work, why interest rates matter far more than perks if you carry a balance, and questions to ask before applying.",
  },
];

router.get("/", (_req, res) => {
  res.json(MODULES);
});

export default router;
