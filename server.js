const express = require('express')
const {createServer} = require("node:http")

const {Server} = require("socket.io")
const cors = require("cors")
const { type } = require('node:os')

const app = express();


app.use(cors());
app.use(express.json())

const server = createServer(app);
const io = new Server(server,{
    cors:{
        origin:"https://chat-liard-zeta-73.vercel.app",
        methods:['POST', 'GET'],
    }
})
app.get("/",async function(req,res){
    res.json({msg:"Hello from backend"})
})


io.on("connection",function(socket){
    console.log("user connected")
    socket.on("joinroom",function(room){
        socket.join(room)
    })

    socket.on("chat",function(obj){
        console.log(obj.room)
        io.to(obj.room).emit("chat",{msg:obj.text,user:obj.sender});
    })
})

server.listen(3000, function(){
    console.log("Server Started")
})

module.exports = app






