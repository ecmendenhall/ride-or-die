import { createConnection } from "typeorm";
import app from "./app";

const PORT = 3000;

createConnection()
  .then(async (connection) => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}.`);
    });
  })
  .catch((error) => console.log(error));
