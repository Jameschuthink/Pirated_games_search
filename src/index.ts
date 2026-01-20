import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";

// Simple host determination for Railway and other cloud providers
const host = env.isRailway || env.isProduction ? "0.0.0.0" : env.HOST;

const server = app.listen(env.PORT, host, () => {
  const { NODE_ENV, PORT } = env;
  logger.info(`Server (${NODE_ENV}) running on http://${host}:${PORT}`);
  if (env.isRailway) {
    logger.info("🚄 Railway deployment detected");
  }
});

const onCloseSignal = () => {
  logger.info("sigint received, shutting down");
  server.close(() => {
    logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
