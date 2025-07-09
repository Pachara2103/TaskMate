import { ServerWebSocket } from "bun";
import { Elysia, t } from 'elysia';
import { SQL } from "bun";
import bcrypt from 'bcryptjs';
import { cors } from '@elysiajs/cors';

import { cookie } from '@elysiajs/cookie'; // ✅ ต้อง import setCookie ด้วย
import { jwt } from '@elysiajs/jwt';




const db = new SQL({
  url: "postgres://bas:password@localhost:2103/TaskMate",
  // tls: false,
  onconnect: client => console.log("✅ Connected to database"),
  onclose: client => console.log("❎ Connection closed")
});


const app = new Elysia()
  .use(cors({
    origin: 'http://localhost:4200',
    credentials: true // (ถ้ามีการใช้ cookie หรือ header พิเศษ)
  }))
  .use(cookie())
  .use(jwt({
    name: 'jwt',
    secret: 'my_secret',
  }))

  .get('/', async () => {
    const rows = await db`SELECT * FROM users`;
    return JSON.stringify(rows);
  })

  .get('/me', async ({ cookie, jwt }) => {
    const token = cookie.userCookies?.value;
    if (!token) return { success: false, message: 'No token found' };

    const user = await jwt.verify(token);
    if (!user) return { success: false, message: 'Invalid token' };

    return { success: true, user: user };
  })

  .post('/login', async ({ body, jwt, cookie: { userCookies } }) => {

    const { username, password } = body;
    const result = await db`
      SELECT * FROM users WHERE username = ${username}`;

    if (result.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

      return { success: false, message: 'Invalid password' };
    }
    console.log('userId:', user.userid, "login success");

    const token = await jwt.sign({
      userid: user.userid,
      username: user.username
    });

    userCookies.set({
      value: token,
      httpOnly: true,
      sameSite: 'strict',
      secure: false
    });

    return { success: true, message: 'Login successful', userId: user.userid };
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String()
    })
  })

  .post('/friendrequest', async ({ body }) => {
    const { userid, friendid } = body;

    const result = await db`
    SELECT * FROM users WHERE userid = ${friendid}`;

    if (result.length === 0) {
      return { success: false, message: 'friend not found' };
    }

    try {
      // เช็คว่ามีคำขอ pending อยู่แล้วหรือไม่
      const existing = await db`
      SELECT * FROM requests 
      WHERE requester_id = ${userid} AND addressee_id = ${friendid} AND status = 'pending'`;

      if (existing.length > 0) {
        // ถ้ามีแล้ว → ลบออก
        await db`
        DELETE FROM requests 
        WHERE requester_id = ${userid} AND addressee_id = ${friendid} AND status = 'pending'`;

        return { success: true, message: 'canceled request' };
      } else {
        // ถ้ายังไม่มี → เพิ่มคำขอใหม่
        await db`
        INSERT INTO requests  (requester_id, addressee_id, status)
        VALUES (${userid}, ${friendid}, 'pending')`;

        return { success: true, message: 'sent request' };
      }
    } catch (err) {
      return { success: false, message: 'request error', error: err };
    }
  }, {
    body: t.Object({
      userid: t.Number(),
      friendid: t.Number(),
    })
  })

  .get('/getrequest', async ({ query }) => {
    const userid = Number(query.userid);
    try {
      // เช็คว่ามีคำขอ pending อยู่แล้วหรือไม่
      const result = await db`
      SELECT  r.requester_id as from_user,u.username as from_username, r.status, r.addressee_id AS to_user, u2.username as to_username
      from requests r
      join users u on u.userid = r.addressee_id
      join users u2 on u2.userid = r.requester_id
      where r.addressee_id = ${userid}`;
      return { success: true, message: 'request success', allusers: result };

    } catch (err) {
      return { success: false, message: 'request error', error: err };
    }
  })

  .post('/responserequest', async ({ body }: { body: { userid: number, friendid: number, type: string } }) => {
    const { userid, friendid, type } = body;

    console.log()

    if (type === "accept") {
      try {
        const result = await db`insert into friends (user_id, friend_id) values (${userid}, ${friendid})`;
        await db`
        DELETE FROM requests 
        WHERE requester_id = ${friendid} AND addressee_id = ${userid} AND status = 'pending'`;

        console.log('success accept friends')
        return { success: true, message: 'request success', allusers: result };


      } catch (err) { return { success: false, message: 'request error', error: err }; }
    }

    if (type === "cancel") {
      try {
        const result = await db`
        DELETE FROM requests 
        WHERE requester_id = ${userid} AND addressee_id = ${friendid} AND status = 'pending'`;
        console.log('cancel friends')

        return { success: true, message: 'request success', allusers: result };

      } catch (err) { return { success: false, message: 'request error', error: err }; }
    }

  })



app.get('/getalluser', async ({ query }) => {
  const userid = Number(query.userid);

  const result = await db`
    SELECT
      u.userid,
      u.username,
      COALESCE(r.status, 'none') AS status
    FROM users u
    LEFT JOIN requests r
      ON r.addressee_id = u.userid AND r.requester_id = ${userid}
    WHERE u.userid != ${userid}
  `;

  return {
    success: true, message: 'Fetched all users and statuses', allusers: result
  };
})

app.get('/getallfriends', async ({ query }) => {
  const userid = Number(query.userid);

  const result = await db`
    SELECT u.userid as friend_id, u.username as friend_name
    FROM friends f
    JOIN users u ON u.userid = 
      CASE 
        WHEN f.user_id = ${userid} THEN f.friend_id
        ELSE f.user_id
      END
    WHERE f.user_id = ${userid} OR f.friend_id = ${userid};`;

  return {
    success: true, message: 'Fetched all friend and statuses', allfriends: result
  };
})


  .listen(4000);

console.log('🟢 Elysia server running on http://localhost:4000');




const sockets = new Set<WebSocket>();
const userRooms = new Map<string, Set<string>>();
const roomMembers = new Map<string, Set<string>>();
const roomIdtoName = new Map<string, string>();
const connections = new Map<string, ServerWebSocket<any>>();

function createRoomId(userId: string, roomName: string): string {
  const raw = `${userId}:${roomName}`;
  return btoa(roomName);
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

      console.log('userId from ws = ', userId)
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

        if (!roomIdtoName.has(createRoomId(userId, roomName))) {
          userRooms.set(userId, new Set());
          userRooms.get(userId)!.add(createRoomId(userId, roomName));
          roomMembers.set(createRoomId(userId, roomName), new Set())
          roomMembers.get(createRoomId(userId, roomName))!.add(userId); //เพิ้มตัวเองในห้อง
          roomIdtoName.set(createRoomId(userId, roomName), roomName);
        } else {
          console.log(`this room name is already exis`);
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
        }
        if (!userRooms.get(friendId)!.has(roomId)) {
          userRooms.get(friendId)!.add(roomId);

          // แก้ตรงนี้
          if (!roomMembers.has(roomId)) {
            roomMembers.set(roomId, new Set());
          }
          roomMembers.get(roomId)!.add(friendId);
        }

        console.log(`you invite ${friendId} to room= ${roomId}`)
        console.log('roomem inviteeeeeeeeeeee', roomMembers);
        console.log('userroom inviteeeeeeeeeee=  ', userRooms);
      }

      if (type === "group_message") {
        console.log('recieve message from client');
        const { userId, message, roomId } = msg;
        if (roomMembers.get(roomId)) {
          console.log("you have this room")
        } else {
          console.log("room not found")
        }

        for (const friendId of roomMembers.get(roomId)!) {
          const friendSocket = connections.get(friendId);
          if (friendSocket) {
            friendSocket.send(JSON.stringify([userId, message]));
          }
        }
      }
      if (type === "friend_message") {
        const { userId, message, friendId } = msg;

        if (connections.get(`${friendId}`)) {
          console.log("found friend")
        } else {
          console.log("friend not found")
        }

        if (connections.get(`${userId}`)) {
          console.log("found user")
        } else {
          console.log("user not found")
        }
        const friendSocket = connections.get(`${friendId}`);
        const userSocket = connections.get(`${userId}`);
        const date = new Date();
        const now = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        if (friendSocket) {
          friendSocket.send(JSON.stringify({ userId: userId, message: message, time: now }));
          if (userSocket) {
            userSocket.send(JSON.stringify({ userId: userId, message: message, time: now }));
          }

          console.log(`userId: ${userId} send '${message}' to userId:${friendId}`)
        } else {
          console.log('friends not online');
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
