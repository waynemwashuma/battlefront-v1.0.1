let login ={
  host: process.env.MYSQLHOST || '127.0.0.1',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database:process.env.MYSQLDATABASE || 'BFlogin',
}
let sess = {
  expiration:1000*60*60*6,
  createDatabaseTable:true,
  schema:{
      tableName:'sessions',
      columnNames:{
          session_id:'sessId',
          expires:'expires',
          data:'data'
      }
  },
  host:process.env.MYSQLHOST || '127.0.0.1',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database:process.env.MYSQLDATABASE ||'BFlogin',
  port:process.env.MYSQLPORT
}
module.exports.users = login;
module.exports.sessionConfig = sess;