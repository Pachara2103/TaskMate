import { Elysia } from "elysia";
import { ServerWebSocket } from "bun";

// const app = new Elysia()
//   .get("/", () => "Hello Elysia")
//   .listen(3000);



const sockets = new Set<WebSocket>();

const userRooms = new Map<string, Set<string>>();
const roomMembers = new Map<string, Set<string>>();
const roomIdtoName = new Map<string, string>();

// const getroomId = new Map<string, string>();


const connections = new Map<string, ServerWebSocket<any>>();

function createRoomId(userId: string, roomName: string): string {
  const raw = `${userId}:${roomName}`;
  return btoa(raw);
}

type WSData = {
  userId: string;
};

Bun.serve({
  port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      // console.log("can't connect without userId")
      return;
    }

    if (server.upgrade(req, { data: { userId } })) {
      return; // สำเร็จ → server จะ handle websocket แทน
    }
    return new Response("Disconnect");
  },
  //const type = msg.type; = const { type, room, text } = msg;

  websocket: {
    open(ws) {
      const { userId } = ws.data as WSData;
      connections.set(userId, ws);
      console.log(`🟢 ${userId} connected`);
    },

    message(ws, rawMessage) {
      let msg: any;

      try {
        const text = typeof rawMessage === 'string'
          ? rawMessage
          : rawMessage.toString('utf-8'); // แปลง Buffer เป็น string

        msg = JSON.parse(text);
      } catch (e) {
        ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
        return;
      }

      const { type } = msg; //const type = msg.type; = const { type, room, text } = msg;

      if (type === "create") {
        const { roomName, userId } = msg;
        // const userRooms = new Map<string, Set<string>>();
        // const roomMembers = new Map<string, Set<string>>();
        // const roomIdtoName = new Map<string, string>();

        if (!roomIdtoName.has(createRoomId(userId, roomName))) {
          userRooms.set(userId, new Set());
          userRooms.get(userId)!.add(createRoomId(userId, roomName));
          roomMembers.set(createRoomId(userId, roomName), new Set())
          roomMembers.get(createRoomId(userId, roomName))!.add(userId); //เพิ้มตัวเองในห้อง
          roomIdtoName.set(createRoomId(userId, roomName), roomName);
        } else {
          console.log(`this room name is already exist`);
          return;
        }

        console.log(`user id=${userId} create  room:${roomName}`);
        console.log('roomem', roomMembers);
        console.log('userroom=  ', userRooms);
      }
      if (type === "invite") {
        const { roomId, friendId } = msg;
        if (!userRooms.has(friendId)) {
          userRooms.set(friendId, new Set());
          userRooms.get(friendId)!.add(roomId);
          roomMembers.get(roomId)!.add(friendId);
        }

        if (!userRooms.get(friendId)!.has(roomId)) {
          userRooms.get(friendId)!.add(roomId);
          roomMembers.get(roomId)!.add(friendId);
        }

        console.log(`you invite ${friendId} to room= ${roomId}`)
        console.log('roomem inviteeeeeeeeeeee', roomMembers);
        console.log('userroom inviteeeeeeeeeeee=  ', userRooms);
      }

      if (type === "message") {
        const { userId, message, roomId } = msg;

        for (const friendId of roomMembers.get(roomId)!) {
          const friendSocket = connections.get(friendId);
          if (friendSocket && friendId != userId) {
            friendSocket.send(`[${userId}] says: ${message}`);
          }
        }
      }

    },

    close(ws) {
      // sockets.delete(ws);
      console.log("🔴 Client disconnected");
    },


  }

});

console.log('running at port 3000')
