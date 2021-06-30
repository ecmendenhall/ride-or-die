import {createConnection, getConnection} from 'typeorm';

const db = {
  connection: {
    async create(){
      await createConnection();
    },

    async close(){
      await getConnection().close();
    }
  },
  testHelpers: {
    async clear() {
      getConnection().synchronize(true);;
    }
  }
};
export default db;
