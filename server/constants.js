import mysql from "mysql2"

export const login ={
    host: process.env.MYSQLHOST || '127.0.0.1',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database:process.env.MYSQLDATABASE || 'BFlogin',
    port:process.env.MYSQLPORT || 3306
  }
export const conn = mysql.createConnection(login);
export const DBpool = mysql.createPool({

})
export const conn2 = conn.promise();

conn.connect(function (err) {
    if (err) console.log('1st err', err.message);
    console.log(" mysql Connected!");
});