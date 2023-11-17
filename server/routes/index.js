import sessionHandler from "express-session";
import  express from "express";
import  Mysql from "express-mysql-session";
import cookieParser from "cookie-parser";

import { conn2 } from "../constants.js";
import { AllianceRouter } from "./alliance.js";
import { PlayerRouter } from "./player.js";
import { UserRouter } from "./user.js";

const mysqlStore = Mysql(sessionHandler)
export const app = express();

let login ={
    host: process.env.MYSQLHOST || '127.0.0.1',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database:process.env.MYSQLDATABASE || 'BFlogin',
    port:process.env.MYSQLPORT || 3306
  }
  let sessionConfig = {
    host: login.host,
    user: login.user,
    password: login.password,
    database:login.database,
    port:login.port,
    expiration:1000*60*60*6,
    createDatabaseTable:true,
    schema:{
        tableName:'sessions',
        columnNames:{
            session_id:'sessId',
            expires:'expires',
            data:'data'
        }
    }
  }
let config = {
    secret: 'uygGVBYYG8yG&12ygYg6637GRV4C',
    rolling: true,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000, secure: false, httpOnly: true, secure: false },
    store: new mysqlStore(sessionConfig, conn2)
}
app.use(express.query());
app.set('view engine', 'ejs')
app.use(sessionHandler(config));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '4kb' }));

app.use("/", UserRouter)
app.use("/", PlayerRouter)
app.use("/", AllianceRouter)