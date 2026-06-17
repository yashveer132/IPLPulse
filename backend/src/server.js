import app from "./app.js";
import { env } from "./config/index.js";

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`\n🏏 IPLPulse API running on ${env.appUrl}`);
  console.log(`   Environment : ${env.nodeEnv}`);
  console.log(`   Health check: ${env.appUrl}/api/v1/health\n`);
});
