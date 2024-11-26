const express = require('express')
const {createServer} = require("node:http")

const {Server} = require("socket.io")
const cors = require("cors")
const mongoose = require("mongoose")
const { type } = require('node:os')

mongoose.connect("mongodb+srv://admin:ElOI40EAnUihKqbR@cluster0.fxyaf.mongodb.net")

const roomschema = new mongoose.Schema({
    room:String,
    messages:[Object]
})

const Room = mongoose.model("rooms", roomschema);
const app = express();


app.use(cors({
    origin: 'https://chat-liard-zeta-73.vercel.app',  // Allow this specific domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow these HTTP methods
    credentials: true  // Allow cookies/credentials in cross-origin requests
}));
app.use(express.json())

// const server = createServer(app);
// const io = new Server(server,{
//     cors:{
//         origin:"https://chat-liard-zeta-73.vercel.app",
//         methods:['POST', 'GET'],
//     }
// })

const http = require('http').Server(app);

const io = require('socket.io')(http);


async function addmessages(obj){
    let roomid;
    let room = await Room.findOne({room:obj.room});
    if(room){
        roomid = room._id.toString()
    }else{
        console.log("Room not Found!!")
    }
    await Room.updateOne(
        {_id:roomid},
        {$push:{messages:obj.msg}}
    )
    console.log("message added")
}

app.get("/",function(req,res){
    res.json({msg:"Hello from backend"})
})

app.post('/chat',function(req,res){
    let data = req.body
    if(data.event == "createroom"){
        Room.findOne({room:data.room})
        .then(function(dbres){
            if(dbres){
                res.send(JSON.stringify({"msg":"Room already exist"}));        
            }else{
                let room = new Room({room:data.room});
                room.save()
                .then(function(result){
                    res.send(JSON.stringify({"msg":"Room Created Successfully"}));               
                }).catch(function(err){
                    res.send(JSON.stringify({"msg":"Error creating the room!!"}));               
                })
            }
        })
    }
    else if(data.event == 'joinroom'){
        Room.findOne({room:data.room})
        .then(function(dbres){
            if(dbres){
                let msgarr = dbres.messages
                res.send(JSON.stringify({"msg":"ok","msgarr":msgarr}));               
            }else{
                res.send(JSON.stringify({"msg":"fail"}));               
            }
        })
    }
})

io.on("connection",function(socket){
    socket.on("joinroom",function(room){
        socket.join(room)
    })

    socket.on("chat",function(obj){
        addmessages(obj);
        io.to(obj.room).emit("chat",obj.msg);
    })
})

http.listen(3000, function(){
    console.log("Server Started")
})

module.exports = app






