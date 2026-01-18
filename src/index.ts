import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";

// Determine the correct host for the environment
// Railway and other cloud providers require 0.0.0.0 to accept external traffic
const host = env.isProduction ? "0.0.0.0" : env.HOST;

const server = app.listen(env.PORT, host, () => {
  const { NODE_ENV, PORT } = env;
  const displayHost = env.isProduction ? "0.0.0.0" : env.HOST;
  logger.info(`Server (${NODE_ENV}) running on http://${displayHost}:${PORT}`);
  if (env.isProduction) {
    logger.info(
      "🚀 Production mode: Listening on 0.0.0.0 for cloud deployment",
    );
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
