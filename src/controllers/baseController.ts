import { Router } from "express";

abstract class BaseController {    
    public router: Router;    

    constructor () {        
        this.router = Router();                
        this.initServices();
        this.initMiddleware();
        this.initRoutes()
    }

    protected abstract initRoutes(): void;
    protected abstract initMiddleware(): void;
    protected initServices() {};
}

export default BaseController