import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { refreshGymsNow } from "./services/cacheGyms.js";
import gymsRouter from "./routes/gyms.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const clientPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../client"
);

app.use(cors());
app.use(express.json());

refreshGymsNow().catch(() => console.log("Startup fetch failed"));
// Routes
app.use("/api/gyms", gymsRouter);
app.use(express.static(clientPath));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
