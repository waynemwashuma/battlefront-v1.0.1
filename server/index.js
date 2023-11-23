import http from 'http'
import {app} from "./routes/index.js"
import { io } from "./io/index.js";
import { initBases } from './game/index.js';

const PORT =process.env.PORT || 3000
const server = http.createServer(app)

io.attach(server)

server.listen(PORT, function () {
    console.log('listening on port::' + PORT);
})

initBases(50)
