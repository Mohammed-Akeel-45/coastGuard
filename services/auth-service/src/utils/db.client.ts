import { Client } from "pg";

const client = new Client();
await client.connect();

export default client;
