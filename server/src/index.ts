import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

dotenv.config({
  path: "./.env",
});

import loginRouter from "./routes/login";

const app = express();

app.use(morgan("dev"));

app.use(cookieParser());

const PORT = 3000;

app.use("/", loginRouter);

// app.get("/", (_req, res) => {
//   res.redirect("/login");
// });

app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}...`);
});
