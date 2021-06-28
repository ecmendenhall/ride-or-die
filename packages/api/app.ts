import 'reflect-metadata';
import express from 'express';

const app = express();

app.get("/goals", (req, res) => {
  res.status(200).send("OK");
});

export default app;
