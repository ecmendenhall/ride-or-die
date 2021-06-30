import {createConnection, getConnection, ConnectionOptions} from 'typeorm';

const TEST_DB_CONFIG : ConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  database: "ride_or_die_test",
  synchronize: true,
  dropSchema: true,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"]
};

export default {
  db: {
    async setUp() {
      await createConnection(TEST_DB_CONFIG);
    },

    async tearDown() {
      await getConnection().close();
    },

    async clear() {
      await getConnection().synchronize(true);
    }

  }
};
