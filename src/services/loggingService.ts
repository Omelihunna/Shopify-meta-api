import winston from "winston";
import path from "path";
import fs from "fs";

class LoggingService {
    private logger: winston.Logger;
    private logDir: string;
    private errorLog: string;
    private combinedLog: string;

    constructor() {        
        this.logDir = path.join(__dirname, "logs");        
        this.errorLog = path.join(this.logDir, "error.log");
        this.combinedLog = path.join(this.logDir, "combined.log");        
        this.ensureLogDirectory();
        
        this.logger = winston.createLogger({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: this.errorLog, level: "error" }),
                new winston.transports.File({ filename: this.combinedLog }),
            ],
        });
        
        if (process.env.NODE_ENV !== "production") {
            this.logger.add(
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    ),
                })
            );
        }
    }

    private ensureLogDirectory(): void {        
        if (!fs.existsSync(this.logDir)) {            
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    logInfo(message: string, metadata?: any): void {
        this.logger.info(message, metadata);
    }

    logWarn(message: string, metadata?: any): void {
        this.logger.warn(message, metadata);
    }

    logError(message: string, metadata?: any): void {
        this.logger.error(message, metadata);
    }

    logDebug(message: string, metadata?: any): void {
        this.logger.debug(message, metadata);
    }

    getLoggerInstance(): winston.Logger {
        return this.logger;
    }
}

export default LoggingService;

