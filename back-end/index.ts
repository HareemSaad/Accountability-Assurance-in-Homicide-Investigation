import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser"; //import body parser
import path from 'path';
import mongoose from "mongoose";
import { Console } from 'console';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config()
let poolRoutes = require('./routes/routes');
const port = 3000;

const app = express();
app.use(express.json())
app.use(cors());
app.use(bodyParser.json());
require("./model/mongooseConnection.js");

app.use("/", poolRoutes.routes);

app.get('/', (req: any, res: any) => res.send('Hello World!'));
// app.get('/fetchTables', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Express app running on port ${port}!`));