import express from "express";
import cors from "cors";
import expressMongoSanitize from "express-mongo-sanitize";
import auth from "./routes/auth.js";
import connectToDB from "./initializers/db.js";
import { Express } from "express";
import uploadRouter from "./routes/upload.js";

const app: Express = express();

app.use(cors());

app.use(express.json());

app.use(expressMongoSanitize());

connectToDB();

app.use("/auth", auth);
app.use("/upload", uploadRouter);

app.listen(3000, "127.0.0.1", () => {
  console.log("Server started at port 3000");
});

export default app;
