import http from 'http'
import {app} from "./routes/index.js"
import { io } from "./io/index.js";
import { VehicleType, creations, gameLib, initBases } from './game/main.js';
import { Base } from './game/index.js';

const PORT =process.env.PORT || 3000
const server = http.createServer(app)

io.attach(server)

server.listen(PORT, function () {
    console.log('listening on port::' + PORT);
})

//initBases(50)
let base = new Base(0,0,{name:"test",alliance:'nullish'})
gameLib.add(base,VehicleType.BASE)
console.log(base);
setInterval(()=>{
    console.log(creations);
},200)