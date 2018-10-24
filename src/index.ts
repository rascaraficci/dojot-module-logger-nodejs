/*Dojot Logger Library*/

import bodyparser from "body-parser";
import * as express from "express";
import { TransformableInfo } from "logform";
import * as winston from "winston";

/* Levels of debug */
const debugLevels = ["debug", "info", "warn", "error"];

function formatParams(info: TransformableInfo) {
    const { timestamp, level, message, ...args } = info;
    const ts = timestamp.slice(0, 19).replace("T", " ");
    const filename = Object.keys(args).length ? ` -- |${args.filename}` : "";
    return `<${ts}>${filename} -- ${level}: ${message}`;
}

/**
 * @description This log module allows the developer to create usefull logs
 * messages with a certain level of severity. This module will work with four
 * levels of logging, wich are dividide into:
 *
 * ERROR: This level serves as the general error feature. It should be used
 * whenever the software encounters an unexpected error that prevents further
 * processing (e.g. cant connect to a port, an error connecting with kafka, a
 * connection refused).
 *
 * WARN: Events that are likely to lead to an error in the future, however, can
 * be corrected by the system runtime (e.g. a fail connection with database,
 * fail trying to retrieve a data, fail trying to get a callback)
 *
 * INFO: System update information events (e.g A new socket connection, a new
 * kafka producer).
 *
 * DEBUG: Events for debug readings, usefull when developers are trying to
 * understand the code (e.g. Kafka Producer is not yet ready,
 * Retrieving/creating new topic). The level severity of logs can be changed
 * via runtime by a http request into: ".../setLog?level={level of your
 * debug}".
 *
 * This modules provides a route via express routes for runtime log level
 * change. An example to create a customized logger:
 *
 * logger.debug("Will initialize ingestion handler device-data at topic \
 * f968b47f-6db7-4434-9e9c-175feb42c68b", {filename: "your module name"})
 *
 * the response will be:
 *
 * <19:48:14 02/08/2018> -- |your module name| -- DEBUG: Will initialize ingestion
 * handler device-data at topic f968b47f-6db7-4434-9e9c-175feb42c68b.
 */

const internalLogger = winston.createLogger({
    exitOnError: false,
    format: winston.format.combine(
        winston.format((info: TransformableInfo)  => {
            info.level = info.level.toUpperCase();
            return info;
        })(),
        winston.format.timestamp({format: "HH:mm:ss DD/MM/YYYY"}),
        winston.format.colorize({all: true}),
        winston.format.printf(formatParams),
    ),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            level: "debug",
        }),
    ],
});

const logger = {
    debug: (data: string, config: any) => { internalLogger.debug(data, config); },
    error: (data: string, config: any) => { internalLogger.error(data, config); },
    getLevel: () => internalLogger.transports[0].level,
    info: (data: string, config: any) => { internalLogger.info(data, config); },
    setLevel: (level: string) => {
        if (debugLevels.indexOf(level) >= 0) {
            internalLogger.transports[0].level = level;
            return 0;
        } else {
            return -1;
        }
    },
    warn: (data: string, config: any) => { internalLogger.warn(data, config); },
};

/**
 * Adds two endpoints related to logging configuration.
 * @param app The express application
 */
function getHTTPRouter(): express.Router {
    const router = express.Router();
    router.use(bodyparser.json());
    router.put("/log", (req: express.Request, res: express.Response) => {
        if (req.body.level !== undefined && req.body.level !== null) {
            if (logger.setLevel(req.body.level) === 0) {
                // Set log level
                res.set(200).send("Level of debugger is set to " + req.body.level);
            } else {
                res.status(400).send("unknown level: " + req.body.level + ", valid are " + debugLevels);
            }
        } else {
            res.status(400).send("undefined level of debugger");
        }
    });

    // tslint:disable-next-line:variable-name
    router.get("/log", (_req: express.Request, res: express.Response) => {
        res.set(200).header({
            "Content-Type": "application/json",
        }).send(JSON.stringify({
            level: logger.getLevel(),
        }));
    });

    return router;
}

export {
    getHTTPRouter,
    logger,
};
