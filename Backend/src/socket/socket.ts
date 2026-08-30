import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import {Server as SocketIOServer, Socket} from 'socket.io'
import { registerUserEvents } from "./userEvents"
import { registerChatEvents } from './chatEvents'
import Conversation from '../modals/Conversation'



dotenv.config()

export function initializeSocket(server:any):SocketIOServer {
    const io = new SocketIOServer(server,{
          cors:{
            origin:"*", //allow all rigins
          }
    }) // socket io server instance


    // auth middleware

    io.use((socket:Socket,next)=>{
            const token  = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error: no token provided !"))
            }

           jwt.verify(token, process.env.JWT_SECRET as string ,(err:any, decoded:any)=>{
            if (err) {
                return next(new Error("Authentication error: invalid token  !"))
            }
            // attached user data to socket
            let userData = decoded.user;
            socket.data = userData;
            socket.data.userId = userData.id;
            next()
           } )
    })
   // when socket connects , register events 
   io.on("connection", async(socket:Socket)=>{
    const userId =  socket.data.userId;
    console.log(`user connected : ${userId}, username:${socket.data.name}`);
    
    // register events
   registerChatEvents(io,socket);
   registerUserEvents(io,socket);

   //join all the conversations of user

   try {
    const conversations = await Conversation.find({
        participants: userId,
    }).select("_id");

    conversations.forEach((conversation:any)=>{
        socket.join(conversation._id.toString());
    });
   } catch (error:any) {
   console.log("error joining conversation rooms:", error);
   }

    socket.on('disconnected', ()=>{
        // user logs out
       console.log(`user connected : ${userId}, username:${socket.data.name}`);
        
    })
   })

    return io;
}