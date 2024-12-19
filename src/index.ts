import express, { Request, Response } from 'express';
import PublicRoutes from './routes/public';
import App from './app';

const PORT = 2918

App.listen(PORT!)
    .loadMiddleware(express.json)
    .loadMiddleware(express.urlencoded, { extended: true })    
    .loadRoute(PublicRoutes)    

App.app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Welcome To Task</h1>');
});
