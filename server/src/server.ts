import express from "express";
import prisma from "./config/db.ts";

const app = express();

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
