import express from "express";
import initLoaders from "./loaders/index.js";
import logger from "./libs/logger.lib.js";

const app = express();


const startApp = async() =>{
    try {
        await initLoaders(app);
        logger.info('Application initialized successfully');
        return app;
    } catch (error) {
        logger.error('Failed to start application:', error);
        throw error;
    }
}

export {app, startApp};