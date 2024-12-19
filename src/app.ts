import express from 'express';
import dotenv from "dotenv";

dotenv.config()
const apiVersion = 'v1';
export const API_PATH = `/api/${apiVersion}`;
class App {
    public app;
    public io: any

    constructor() {
        this.app = express();
    }

    loadRoute(routes: any) {        
        new routes(this.app).initRoutes()       
        return this;
    }
    loadMiddleware(middleware: any, params?: any) {
        if (params) {
            this.app.use(middleware(params));
        } else {
            this.app.use(middleware());
        }
        return this;
    }
    listen(port: any) {
        this.app.listen(port, () => {
            console.log(`Server is now listening on port ${port}`);
        })        
        return this;
    }


}

export default new App();