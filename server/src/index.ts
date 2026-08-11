import express from "express";
import cors from "cors";
import transactionsRouter from "./routes/transactions";
import scenariosRouter from "./routes/scenarios";
import lifestyleGoalsRouter from "./routes/lifestyleGoals";
import debtsRouter from "./routes/debts";
import educationRouter from "./routes/education";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/transactions", transactionsRouter);
app.use("/api/scenarios", scenariosRouter);
app.use("/api/lifestyle-goals", lifestyleGoalsRouter);
app.use("/api/debts", debtsRouter);
app.use("/api/education", educationRouter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
