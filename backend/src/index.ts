import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import transcriptRouter from "./routes/transcriptRouter";
import queryRouter from "./routes/queryRouter";


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/transcripts", transcriptRouter);
app.use("/query", queryRouter);


app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
