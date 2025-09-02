import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { refreshGymsNow } from "./services/cacheGyms.js";
import gymsRouter from "./routes/gyms.js";

dotenv.config();
const app = express();
const PORT = 8080 || process.env.PORT;

app.use(cors());
app.use(express.json());

refreshGymsNow().catch(() => console.log("Startup fetch failed"));
// Routes
app.use("/api/gyms", gymsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
