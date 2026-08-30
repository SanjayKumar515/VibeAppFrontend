import { Server as SocketIOServer, Socket } from "socket.io";
import Conversation from "../modals/Conversation";
import Message from "../modals/Message";


export function registerChatEvents(io: SocketIOServer, socket: Socket) {

    socket.on("getConversations", async () => {
        console.log("getConversations event received");
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("getConversations", {
                    success: false,
                    msg: "User not authenticated",
                });
                return;
            }

            // Fetch conversations where the user is a participant
            const conversations = await Conversation.find({
                participants: userId,
            })
            .sort({ updatedAt: -1 })
            .populate({
                path: 'lastMessage',
                select: 'content senderId attachment createdAt',
            })

             .populate({
                path: 'participants',
                select: 'name avatar email',
            }).lean();

            socket.emit("getConversations", {
                success: true,
                data: conversations,
            });
            
            
        } catch (error:any) {
             console.log("error in getConversation:", error);
            socket.emit("getConversation", {
                success: false,
                msg: "error get conversation",
            });
            
        }
    })
    
    socket.on("newConversation",async (data) => {
        console.log("newConversation event:", data);
        try {
            if (data.type == 'direct') {
                // create direct conversation

                const existingConversation = await Conversation.findOne({
                    type: 'direct',
                    participants: { $all:data.participants, $size:2 },
                }).populate({
                    path: 'participants',
                    select: 'name avatar email',
                }).lean();
                if (existingConversation) {
                     socket.emit("newConversation", {
                        success: true,
                        data: {...existingConversation, isNew: false},
                    });
                    return;
                }
            }

            // create new conversation
            const newConversation = await Conversation.create({
                type: data.type,
                participants: data.participants,
                name: data.name|| "",
                avatar: data.avatar || "",
                createdBy: socket.data.userId,
            });
            
            //get all connected sockets

            const connectedSockets = Array.from(io.sockets.sockets.values()).filter((s)=> data.participants.includes(s.data.userId)
            );

          //join the conversation room
            connectedSockets.forEach(participantSocket=>{
                participantSocket.join(newConversation._id.toString());
            });
           
            // send conversation data back (with populated participants)
            const populatedConversation = await Conversation.findById(newConversation._id)
            .populate({
                path: 'participants',
                select: 'name avatar email',
            }).lean();
        
            if (!populatedConversation) {
                throw new Error("Failed to populate conversation");   
            }
           //emit conversation data to all participants
              io.to(newConversation._id.toString()).emit("newConversation", {
                success: true,
                data: {...populatedConversation, isNew: true},
                msg: "Conversation created successfully",
              });


        } catch (error) {
            console.log("error in newConversation:", error);
            socket.emit("newConversation", {
                success: false,
                msg: "failed to create conversation",
            });
        }
    });
    socket.on("newMessage", async (data)=>{
       // console.log('newMessage event:', data);
        try {
            const message = await Message.create({
                conversationId:data.conversationId,
                senderId: data.sender.id,
                content:data.content,
                attachement:data.attachement
            });

             io.to(data.conversationId).emit("newMessage", {
                success: true,
                data: {
                    id:message._id,
                    content:data.content,
                    sender:{
                        id:data.sender.id,
                        name:data.sender.name,
                        avatar:data.sender.avatar,
                    },
                    attachement:data.attachement,
                    createdAt:new Date().toISOString(),
                    conversationId:data.conversationId,
                },
              });
            
            // update conversation's last message
           await Conversation.findByIdAndUpdate(data.conversationId,{
            lastMessage:message._id,
           }) 

        } catch (error) {
            console.log("newMessage error:", error);
            socket.emit("newMessage", {
                success: false,
                msg: "Failed to send message",
            });
        }
    })

    socket.on("getMessages", async (data:{conversationId:string})=>{
       // console.log('newMessage event:', data);
        try {
            const messages = await Message.find({
                  conversationId:data.conversationId
            })
            .sort({createdAt:-1}) // newest first
            .populate<{senderId:{_id:string; name:string; avatar:string}}>({
                     path:"senderId",
                     select:"name avatar",
            })
            .lean();

            const messagesWithSender = messages.map(message=>({
                ...message,
                id:message._id,
                sender:{
                    id:message.senderId._id,
                    name:message.senderId.name,
                    avatar:message.senderId.avatar,
                }
            }))
            socket.emit("getMessages",{
                success:true,
                data:messagesWithSender,
            })
        } catch (error) {
            console.log("getMessages error:", error);
            socket.emit("getMessages", {
                success: false,
                msg: "Failed to fetch messages",
            });
        }
    })
}