import { Server as SocketIOServer, Socket } from "socket.io";
import User from "../modals/User";
import { generateToken } from "../utils/token";

// Utility to remove undefined properties
function cleanUpdateData( obj: Record<string, any> ) {
  return Object.fromEntries(
    Object.entries( obj ).filter( ( [ _, value ] ) => value !== undefined )
  );
}

export function registerUserEvents( io: SocketIOServer, socket: Socket ) {
  socket.on( "testSocket", ( data ) => {
    socket.emit( "testSocket", { msg: "its working!!!" } );
  } );

  socket.on(
    "updateProfile",
    async ( data: { name?: string; avatar?: string } ) => {
      console.log( "updateProfile event:", data );

      const userId = socket.data.userId;
      if ( !userId ) {
        return socket.emit( "updateProfile", {
          success: false,
          msg: "Unauthorized",
        } );
      }

      try {
        // Only include defined fields in update
        const updateData = cleanUpdateData( {
          name: data.name,
          avatar: data.avatar,
        } );

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          updateData,
          { new: true }
        );

        if ( !updatedUser ) {
          return socket.emit( "updateProfile", {
            success: false,
            msg: "User not found",
          } );
        }

        // Generate fresh token for updated profile
        const newToken = generateToken( updatedUser );

        socket.emit( "updateProfile", {
          success: true,
          data: { token: newToken },
          msg: "Profile updated successfully",
        } );
      } catch ( error ) {
        console.log( "error updating profile:", error );
        socket.emit( "updateProfile", {
          success: false,
          msg: "error updating profile",
        } );
      }
    }
  );

  socket.on( "getContacts", async () => {
    try {
      const currentUserId = socket.data.userId;
      if ( !currentUserId ) {
        socket.emit( "getContacts", {
          success: false,
          msg: "Unauthorized",
        } );
        return
      }
      const users = await User.find(
        { _id: { $ne: currentUserId } },
        { password: 0 }
      ).lean()

      const contacts = users.map( ( user ) => ( {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      } ) )

       socket.emit( "getContacts", {
        success: true,
        data:contacts,
      } );

    } catch ( error: any ) {
      console.log( "getContacts errors: ", error )
      socket.emit( "getContacts", {
        success: false,
        msg: "failed to fetch contacts",
      } );
    }
  } )
}


