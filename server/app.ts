// server/app.ts

import postgres from 'postgres';
import Server from './src/Server';

// 1) CHANGE THIS to the DB you actually created (luckybet)
const sql = postgres({
  database: process.env.PGDATABASE || 'luckybet',
  // you can also specify host/user/password here if needed
  // host: 'localhost',
  // user: 'postgres',
  // password: 'yourpass',
});

const server = new Server({
  host: '0.0.0.0',
  port: 3000,
  sql,
});

async function main() {
  await server.start();
  console.log('✅ Server is up.');
}

main().catch(err => {
  console.error('🔥 Failed to start server', err);
  process.exit(1);
});
