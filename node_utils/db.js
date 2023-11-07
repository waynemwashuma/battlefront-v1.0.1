let login ={
  host: process.env.MYSQLHOST || '127.0.0.1',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database:process.env.MYSQLDATABASE || 'BFlogin',
  port:process.env.MYSQLPORT || 3306
}
let sess = {
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
module.exports.users = login;
module.exports.sessionConfig = sess;