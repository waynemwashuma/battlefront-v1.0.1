let login ={
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database:process.env.MYSQLDATABASE
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
  host:process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database:process.env.MYSQLDATABASE
}
module.exports.users = login;
module.exports.sessionConfig = sess;