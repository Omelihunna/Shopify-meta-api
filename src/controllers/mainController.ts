import { Request, Response, NextFunction, Router } from "express";
import fs from "fs";
import path from "path";
import axios from "axios"; 
import BaseController from "./baseController";
import dotenv from "dotenv";
import crypto from "crypto"
import LoggingService from "../services/loggingService";

class MainController extends BaseController {
    private accessToken: string;
    private pixel: string
    private loggingService!: LoggingService

    constructor() {
        super();
        dotenv.config();
        this.accessToken = process.env.META_ACCESS!
        this.pixel = process.env.META_PIXEL!
    }

    protected initServices(): void {
        this.loggingService = new LoggingService()
    }

    protected initRoutes(): void {
        this.router.post(
            "/order/create",
            async (req: Request, res: Response, next: NextFunction): Promise<void> => {
                try {
                    const { id, order_number: event_id } = req.body;
                    const orderData = req.body                                       

                    if (!event_id || !id || !orderData) {
                        res.status(400).json({ message: "Missing required data" });
                        return;
                    }                 
                    
                    const hashData = (data: string): string => crypto.createHash("sha256").update(data).digest("hex");

                    const conversionPayload = {
                        data: [
                            {
                                event_name: "Purchase",
                                event_time: Math.floor(Date.now() / 1000),
                                action_source: "website",
                                user_data: {
                                    em: orderData.email ? [hashData(orderData.email)] : [],
                                    ph: orderData.phone ? [hashData(orderData.phone)] : [],
                                },
                                custom_data: {
                                    currency: String(orderData.currency || "USD"),
                                    value: String(orderData.total_price || "0.00"),
                                    content_ids: orderData.content_ids || [],
                                    content_type: orderData.content_type || "product",
                                },
                                original_event_data: {
                                    event_name: "Purchase",
                                    event_time: Math.floor(Date.now() / 1000),
                                },
                            },
                        ],
                    };      
                    
                    if (!conversionPayload.data[0].user_data.em.length && !conversionPayload.data[0].user_data.ph.length) {
                        throw new Error("Email or phone data must be provided.");
                    }      

                    const metaResponse = await axios.post(
                        `https://graph.facebook.com/v13.0/${this.pixel}/events?access_token=${this.accessToken}`, 
                        conversionPayload,
                        {
                            headers: {
                                "Content-Type": "application/json",                                
                            },
                        }
                    );

                    const eventRecord = {
                        event_id,
                        id,
                        orderData,
                        timestamp: new Date().toISOString(),
                    };

                    const filePath = path.join(__dirname, "order_events.csv");                    

                    let existingData: any[] = [];
                    if (fs.existsSync(filePath)) {                        
                        const rawData = fs.readFileSync(filePath, "utf-8");
                        existingData = JSON.parse(rawData);
                    }

                    existingData.push(eventRecord);
                    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));                    

                    this.loggingService.logInfo("Event recorded successfully", {
                        conversionPayload,
                        metaResponse: metaResponse.data,
                    });

                    res.status(200).json({
                        message: "Event recorded successfully",
                        eventRecord,
                    });
                } catch (error: any) {
                    this.loggingService.logError("Error handling webhook", {
                        error: error.message,
                        stack: error.stack,
                    });
                    next(error); 
                }
            }
        );
    }

    protected initMiddleware(): void {        
    }
}

export default new MainController().router;
