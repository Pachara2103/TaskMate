import db from "./controllers/db";
import { ServerWebSocket } from "bun";

const connections = new Map<string, ServerWebSocket<any>>();

type WSData = {
  userId: string;
};

function startWebSocket() {
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

        console.log("userId from ws = ", userId);
        connections.set(userId, ws);
        console.log(`🟢 ${userId} connected`);
      },

      async message(ws, rawMessage) {
        let msg: any;

        try {
          const text =
            typeof rawMessage === "string"
              ? rawMessage
              : rawMessage.toString("utf-8"); // แปลง Buffer เป็น string
          msg = JSON.parse(text);
        } catch (e) {
          ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
          return;
        }

        const { type } = msg;

        if (type === "room_message") {
          const { userId, message, roomId } = msg;

          try {
            const room =
              await db` select * from rooms where roomid = ${roomId}`;

            if (room.length === 0) {
              console.log("do not have this room");
            } else {
              const member = room[0].member_id.split(","); //string
              const insert =
                await db`insert into room_chat (sender_id,room_id,chatmessage) values(${userId}, ${roomId}, ${message}) RETURNING *`;

              for (const friendId of member) {
                const friendSocket = connections.get(friendId);
                if (friendSocket && friendId != userId) {
                  friendSocket.send(
                    JSON.stringify({
                      type: "room",
                      roomchatid: insert[0].roomchatid,
                      sender_id: userId,
                      chatmessage: message,
                      room_id: insert[0].room_id,
                      send_time: insert[0].send_time,
                    })
                  );
                  //เมื่อส่งข้อมูลผ่านเครือข่าย (เช่น ผ่าน WebSocket, HTTP, API) เราต้องแปลงข้อมูลให้เป็น string ก่อน เพราะ protocol พวกนี้รับส่งข้อมูลแบบข้อความ (text) ฝั่งรับสามารถแปลง string นี้กลับเป็น object โดยใช้ JSON.parse() เพื่อใช้งานต่อได้
                } else {
                  console.log("friend not online");
                }
              }
            }
          } catch (e) {
            console.error(e, "send room mesage unsuccessful");
          }
        }

        if (type === "friend_message") {
          let { userId, message, friendId } = msg;
          userId = Number(userId);
          friendId = Number(friendId);

          try {
            const friend =
              await db`select * from users where userid = ${friendId}`;

            if (friend.length === 0) {
              console.log("do not have this friend");
            } else {
              const insert =
                await db`insert into personal_chat (sender_id,receiver_id,chatmessage) values(${userId}, ${friendId}, ${message}) RETURNING *`;

              const friendSocket = connections.get(`${friendId}`);
              if (friendSocket) {
                friendSocket.send(
                  JSON.stringify({
                    type: "friend",
                    sender_id: userId,
                    receiver_id: friendId,
                    chatmessage: message,
                    send_time: insert[0].send_time,
                  })
                );
              } else {
                console.log("friend not online");
              }
            }
          } catch (e) {
            console.error(e, "send mesage to friend unsuccessful");
          }
        }
      },

      close(ws) {
        console.log("🔴 Client disconnected");
      },
    },
  });

  console.log("🟢 websocket running on port 3000");

}

export default startWebSocket;
