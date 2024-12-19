import { API_PATH } from "../app";
import {Express} from "express";
import mainController from "../controllers/mainController";

class PublicRoutes {
    private app: Express;

    constructor(app: Express) {
        this.app = app;        
    }

    initRoutes() {
        this.app.get(API_PATH, (req, res) => {
            res.send('api active');
        })    
        this.app.use(API_PATH, mainController);    
    }

}

export default PublicRoutes;