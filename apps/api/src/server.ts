import { loadConfig } from './config';
import { Store } from './db';
import { buildApp } from './app';

const config = loadConfig();
const store = new Store(config.dbPath);
await store.seed({ email: config.adminEmail, password: config.adminPassword });
if (!config.adminEmail || !config.adminPassword) {
  console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin account will be created on first run.');
}
const app = await buildApp(config, store);

const shutdown = async () => {
  await app.close();
  store.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port: config.port, host: config.host });
