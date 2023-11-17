import http from 'http'
import {app} from "./routes/index.js"

const PORT =process.env.PORT || 3000
const server = http.createServer(app)

server.listen(PORT, function () {
    console.log('listening on port::' + PORT);
})