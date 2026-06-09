import { app, startApp } from "./src/app.js";
import { env } from "./src/config/env.js";
import logger from "./src/libs/logger.lib.js";

const bootstrap = async () => {
  try {
    await startApp();

    const server = app.listen(env.PORT, () => {
      logger.info(
        `Server running on http://localhost:${env.PORT}`
      );
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    logger.error("Server startup failed", error);
    process.exit(1);
  }
};

bootstrap();