import mysql from "mysql2"

export const login = {
  host: process.env.MYSQLHOST || '127.0.0.1',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'BFlogin',
  port: process.env.MYSQLPORT || 3306
}
export const conn = mysql.createConnection(login);
export const DBpool = mysql.createPool({})
export const conn2 = conn.promise();

export const mapWidth = 20000,
  mapHeight = 20000,
  baseWidth = 700,
  baseHeight = 400,
  turrentSpacing = 5,
  turrentRadius = 20,
  maxFlaks = 10,
  spawnWidth = 250,
  spawnHeight = 100,
  flakRadius = 20
export const codes = {
  actioncodes: {
    creation: 1001,
    occupation: 1010,
    damage: 1100,
    destruction: 1000,
    movement: 11100
  },
  objcodes: {
    tank: 100,
    APC: 200,
    flak: 300,
    base: 500
  }
}

conn.connect(function (err) {
  if (err) console.log('1st err', err.message);
  console.log(" mysql Connected!");
});
function* generator() {
  for (let i = 0; i < Infinity; i++) {
    yield i
  }
}
export const gen = generator();