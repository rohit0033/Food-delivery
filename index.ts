import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Database';
import {port } from './config';

const StartServer = async () => {

    const app = express();

    await dbConnection()

    await App(app);

    app.listen(port, () => {
        console.log(`Listening to port  ${port}`);
    })
}

StartServer();