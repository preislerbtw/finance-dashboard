import { Pool, types } from "pg";
import { env } from "../src/config/env";

types.setTypeParser(1082, (value) => value);

export const pool = new Pool({
  connectionString: env.databaseUrl,
});