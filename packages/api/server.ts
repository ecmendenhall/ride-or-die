import { createConnection } from "typeorm";
import app from './app';


createConnection().then(async connection => {
  const port = 3000;

  app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
  });

}).catch(error => console.log(error));
