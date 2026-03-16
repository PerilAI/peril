#!/usr/bin/env node
import { startServer } from "./index.js";

startServer().then(({ url }) => {
  console.log(`[peril] Server listening on ${url}`);
  console.log(`[peril] Dashboard: ${url}`);
  console.log(`[peril] API: ${url}/api/reviews`);
  console.log(`[peril] CORS enabled for all origins`);
});
