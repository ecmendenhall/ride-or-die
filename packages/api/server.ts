import { createConnection } from "typeorm";
import app from "./src/app";

const PORT = 3001;

createConnection()
  .then(async (connection) => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}.`);
    });
  })
  .catch((error) => console.log(error));
