import { ServerWebSocket } from "bun";
import { Elysia, t } from 'elysia';
import bcrypt from 'bcryptjs';
import { cors } from '@elysiajs/cors';

import { cookie } from '@elysiajs/cookie'; // ✅ ต้อง import setCookie ด้วย
import { jwt } from '@elysiajs/jwt';
import staticPlugin from '@elysiajs/static';
import { writeFileSync } from 'fs'
import { join } from 'path'
import postgres from 'postgres';


const db = postgres(process.env.DATABASE_URL!);

interface Subtask {
  subtask: string;
  status: string;
}

interface Detail {
  detail_id: number,
  tasks: string;
  status: string;
  subtasks: Subtask[];
}



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
  .use(
    staticPlugin({
      prefix: '/uploads',
      assets: './src/uploads'
    })
  )


  .post('/upload', async ({ body }) => {
    console.log('file=', body.file)
    const { file, userid, roomid, type } = body;
    const intuserid = Number(userid);

    try {

      if (!file) {
        console.log('upload failed');
        return { success: false, message: 'No file uploaded' };
      }
      const buffer = await file.arrayBuffer();
      let filename;
      if (type === 'user') {
        filename = `${userid}.png`;
        await db`
        update users set profile  = ${userid} where userid = ${intuserid}`;
      }
      else if (type === 'room') {
        filename = `${roomid}.png`;
        await db`
        update rooms set profile  = ${roomid} where roomid = ${roomid}`;
      }
      const filepath = join('./src/uploads', filename!);
      writeFileSync(filepath, Buffer.from(buffer));

      return { success: true, message: 'upload success', filename: filename };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, message: 'upload failed' };
    }

  }, {
    body: t.Object({
      file: t.File({ format: 'image/*' }),
      userid: t.String(),
      roomid: t.String(),
      type: t.String()
    })
  })

  ///////////////////////////////////////////////////// login //////////////////////////////////////////////////////////////


  .get('/me', async ({ cookie, jwt }) => {
    try {
      const token = cookie.userCookies?.value;
      if (!token) return { success: false, message: 'No token found' };
      const user = await jwt.verify(token);
      if (!user) return { success: false, message: 'Invalid token' };
      return { success: true, user: user };
    }
    catch (error) {
      return { success: false };
      console.error(error)
    }

  })

  .post('/login', async ({ body, jwt, cookie: { userCookies } }) => {

    const { email, password } = body;
    const result = await db`
      SELECT * FROM users WHERE email = ${email}`;

    if (result.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

      return { success: false, message: 'Invalid password' };
    }

    const token = await jwt.sign({ userid: user.userid, email: user.email, username: user.username, profile: user.profile });

    userCookies.set({
      value: token,
      httpOnly: true,
      sameSite: 'strict',
      secure: false
    });

    return { success: true, message: 'Login successful' };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  })

  .post('/signup', async ({ body }) => {

    const { email, password, username } = body;

    try {

      const user = await db`
      SELECT * FROM users WHERE email = ${email}`;

      if (user.length === 0) {
        const newpass = await bcrypt.hash(password, 10);

        const inserted = await db`
      insert into users (username, password, email) values(${username},${newpass}, ${email}) returning *`;

        const newuserid = inserted[0].userid;


        return { success: true, message: 'signup success please login', userid: newuserid };

      } else {
        return { success: false, message: 'This email already exists' };
      }

    } catch (error) {
      return { success: false, message: error };
    }


  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
      username: t.String()
    })
  })



  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////






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

  .get('/getalltasks', async ({ query }) => {
    const userid = Number(query.userid);
    const type = query.type;
    let raw = [];
    try {

      if (type === 'All') {
        raw = await db`
      SELECT 
  t.task_id, t.title, t.description, t.category, 
  t.type_task AS type, t.room_id, t.room_name, 
  t.bookmark, t.start_time, t.end_time, 
  d.detail_id, d.task_title, d.status AS detail_status, 
  s.subtask, s.status AS subtask_status, s.subtask_id
   FROM tasks t
   JOIN task_details d ON t.task_id = d.task_id
   LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
   LEFT JOIN rooms r ON t.room_id = r.roomid
   WHERE ${query.userid} = ANY (string_to_array(r.member_id, ',')) or t.from_user_id = ${userid}
   ORDER BY t.start_time, t.end_time ASC;
    `;
      }
      else if (type === 'My task') {
        raw = await db`
      SELECT 
        t.task_id, t.title,t.description,t.category, t.type_task AS type,t.room_id,t.room_name,t.bookmark, t.start_time, t.end_time,d.detail_id, d.task_title, d.status AS detail_status, s.subtask, s.status AS subtask_status, s.subtask_id
      FROM tasks t
      JOIN task_details d ON t.task_id = d.task_id
      LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
      WHERE t.from_user_id = ${userid} and t.type_task = 'personal'
      ORDER BY t.task_id, d.detail_id, s.subtask_id asc;
    `;
      } else if (type === 'Team task') {
        raw = await db`
      SELECT 
        t.task_id, t.title,t.description,t.category, t.type_task AS type,t.room_id,t.room_name,t.bookmark, t.start_time, t.end_time,d.detail_id, d.task_title, d.status AS detail_status, s.subtask, s.status AS subtask_status, s.subtask_id
      FROM tasks t
      JOIN task_details d ON t.task_id = d.task_id
      LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
      LEFT JOIN rooms r ON t.room_id = r.roomid
      WHERE t.type_task = 'team' and ( ${query.userid} = ANY (string_to_array(r.member_id, ',')) or t.from_user_id = ${userid})
      ORDER BY t.task_id, d.detail_id, s.subtask_id asc;
    `;
      } else if (type === 'Deadline') {
        raw = await db`
      SELECT 
      t.task_id, t.title,t.description,t.category, t.type_task AS type,t.room_id,t.room_name,t.bookmark, t.start_time, t.end_time,d.detail_id, d.task_title, d.status AS detail_status, s.subtask, s.status AS subtask_status, s.subtask_id
      FROM tasks t
      JOIN task_details d ON t.task_id = d.task_id
      LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
      LEFT JOIN rooms r ON t.room_id = r.roomid
      WHERE ${query.userid} = ANY (string_to_array(r.member_id, ',')) or t.from_user_id = ${userid}
      ORDER BY t.end_time asc;
    `;
      }
      else if (type === 'Completed') {
        raw = await db`
   SELECT t.task_id, t.title, t.description, t.category, t.type_task AS type, t.room_id, t.room_name, t.bookmark, t.start_time, t.end_time, d.detail_id, d.task_title, d.status AS detail_status, s.subtask, s.status AS subtask_status, s.subtask_id
   FROM tasks t JOIN task_details d ON t.task_id = d.task_id LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id LEFT JOIN rooms r ON t.room_id = r.roomid
WHERE (${query.userid} = ANY (string_to_array(r.member_id, ',')) OR t.from_user_id = ${userid})
  AND NOT EXISTS (
    SELECT 1 FROM task_details td 
    WHERE td.task_id = t.task_id AND td.status != 'completed'
  )
  AND NOT EXISTS (
    SELECT 1 FROM task_details td
    JOIN task_subtasks st ON st.detail_id = td.detail_id
    WHERE td.task_id = t.task_id AND st.status != 'completed'
  )
ORDER BY t.end_time ASC;`;
      } else if (type === 'Fav') {
        raw = await db`
  SELECT t.task_id, t.title, t.description, t.category, t.type_task AS type, t.room_id, t.room_name, t.bookmark, t.start_time, t.end_time, d.detail_id, d.task_title, d.status AS detail_status, s.subtask, s.status AS subtask_status, s.subtask_id
FROM tasks t
JOIN task_details d ON t.task_id = d.task_id
LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
LEFT JOIN rooms r ON t.room_id = r.roomid
WHERE t.bookmark = true
  AND (${query.userid} = ANY (string_to_array(r.member_id, ',')) OR t.from_user_id = ${userid})
ORDER BY t.end_time ASC;
`;
      }

      else {
        return {
          success: true,
          message: 'request success',
          alltasks: []
        };
      }

      const taskMap = new Map();

      for (const row of raw) {
        const {
          task_id, title, description, category, type, room_id, room_name, bookmark, start_time, end_time, detail_id, task_title, detail_status, subtask, subtask_status, subtask_id
        } = row;

        if (!taskMap.has(task_id)) {
          taskMap.set(task_id, {
            task_id, title, description, category, type, room_id, room_name, bookmark, start_time, end_time, detail: []
          });
        }

        const task = taskMap.get(task_id);

        let detailGroup = task.detail.find((g: Detail[]) => g.some(d => d.tasks === task_title && d.status === detail_status && d.detail_id === detail_id));
        if (!detailGroup) {
          detailGroup = [{
            detail_id: detail_id,
            tasks: task_title,
            status: detail_status,
            subtasks: []
          }];
          task.detail.push(detailGroup);
        }

        const detail = detailGroup.find((d: Detail) => d.tasks === task_title && d.status === detail_status);

        if (subtask) {
          if (!detail.subtasks.some((s: Subtask) => s.subtask === subtask)) {
            detail.subtasks.push({ subtask, status: subtask_status, subtask_id });
          }
        }
      }
      // console.log('type = ', type)

      return {
        success: true,
        message: 'request success',
        alltasks: Array.from(taskMap.values())
      };


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



  .get('/getalluser', async ({ query }) => {
    const userid = Number(query.userid);
    const username = query.username;
    let result;

    try {

      if (username.trim() === '') {
        result = await db`
   SELECT u.userid, u.username, COALESCE(
    CASE WHEN f.user_id IS NOT NULL THEN 'friend' ELSE r.status END,'none' ) AS status,u.profile
   FROM users u
   LEFT JOIN friends f
     ON (f.user_id = ${userid} AND f.friend_id = u.userid) OR (f.friend_id = ${userid} AND f.user_id = u.userid)
   LEFT JOIN requests r
     ON r.requester_id = ${userid} AND r.addressee_id = u.userid
   WHERE u.userid != ${userid}
  `;
      } else {
        result = await db`
   SELECT u.userid, u.username, COALESCE(
    CASE WHEN f.user_id IS NOT NULL THEN 'friend' ELSE r.status END,'none' ) AS status, u.profile
   FROM users u
   LEFT JOIN friends f
     ON (f.user_id = ${userid} AND f.friend_id = u.userid) OR (f.friend_id = ${userid} AND f.user_id = u.userid)
   LEFT JOIN requests r
     ON r.requester_id = ${userid} AND r.addressee_id = u.userid
   WHERE u.userid != ${userid} AND u.username ILIKE ${username + '%'}`;
      }

      return {
        success: true, message: 'Fetched all users and statuses', allusers: result
      };

    } catch (error) {
      console.error(error)
      return {
        success: false, message: 'alluser request error',
      };
    }
  })

  .get('/getallfriends', async ({ query }) => {
    const userid = Number(query.userid);

    const result = await db`
    SELECT u.userid as friend_id, u.username as friend_name, u.profile
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

  .get('/getallrooms', async ({ query }) => {
    const userid = query.userid;

    const result = await db`
    SELECT * FROM rooms WHERE ${userid} = ANY (string_to_array(member_id, ','));`;
    // console.log('room= ', result)

    return {
      success: true, message: 'Fetched all rooms and statuses', allrooms: result
    };
  })


  .post('/addtask', async ({ body }: { body: { userid: number, title: string, description: string, category: string, start_time: Date, end_time: Date, type_task: string, main_task: Array<string>, sub_task: Array<Array<string>> } }) => {
    const { userid, title, description, category, start_time, end_time, type_task, main_task, sub_task } = body;
    try {

      if (
        !userid ||
        !title?.trim() ||
        !description?.trim() ||
        !category?.trim() ||
        !start_time ||
        !end_time ||
        !type_task?.trim()
        || main_task.length === 0
      ) {
        return {
          success: false,
          message: 'please fill your information',
          data: body
        };
      }

      // เพิ่ม task หลัก
      const inserted = await db`
      INSERT INTO tasks (from_user_id, title, description, category, start_time, end_time, type_task)
      VALUES (${userid}, ${title}, ${description}, ${category}, ${start_time}, ${end_time}, ${type_task})
      RETURNING task_id;
    `;
      const taskId = inserted[0].task_id;

      for (let i = 0; i < main_task.length; i++) {
        const main = main_task[i];

        const detail = await db`
        INSERT INTO task_details (task_id, task_title)
        VALUES (${taskId}, ${main})
        RETURNING detail_id;
      `;

        const detailId = detail[0]?.detail_id;
        if (sub_task.length != 0) {
          for (let j = 0; j < sub_task[i].length; j++) {
            const sub = sub_task[i][j];

            await db`
          INSERT INTO task_subtasks (detail_id, subtask)
          VALUES (${detailId},${sub});
        `;
          }
        }

      }

      return {
        success: true,
        message: 'added task successfully'
      };

    } catch (error) {
      console.error('❌ Server Error:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  })
  .post('/updatemainstatus', async ({ body }: { body: { update_task: { detail_id: number, tasks: string, status: string, subtasks: Array<{ subtask: string, status: string }> }, task_id: number, ismain: boolean } }) => {
    const { update_task, task_id } = body;

    const status = (update_task.status === 'completed') ? 'incomplete' : 'completed';

    await db`
       update task_details
       set status =  ${status}
       where detail_id = ${update_task.detail_id}`;

    for (const s of update_task.subtasks) {
      if (status === 'completed') {
        await db`
           update task_subtasks
           set status =  ${status}
           where detail_id = ${update_task.detail_id}`
      } else {
        await db`
           update task_subtasks
           set status =  ${status}
           where detail_id = ${update_task.detail_id}`
      }
    }

    return {
      success: true,
      message: 'update task successfully',
      task_id
    };
  })

  .post('/updatebookmark', async ({ body }: { body: { ismark: boolean, task_id: number } }) => {
    const { ismark, task_id } = body;
    await db`
       update tasks
       set bookmark = ${ismark}
       where task_id = ${task_id}`;

    return {
      success: true,
      message: 'update bookmark successfully',
    };
  })

  .get('/daterange', async () => {
    const min = await db`SELECT MIN(start_time) AS min FROM tasks`;
    const max = await db`SELECT MAX(end_time) AS max FROM tasks`;
    return {
      success: true,
      message: 'Got date range successfully',
      min: min[0].min,
      max: max[0].max
    };
  })

  .post('/delete', async ({ body }: { body: { task_id: number } }) => {
    const { task_id } = body;
    await db`
       delete from tasks where task_id = ${task_id}`;

    return {
      success: true,
      message: 'delete successfully',
    };
  })

  .get('/daterange', async () => {
    const min = await db`SELECT MIN(start_time) AS min FROM tasks`;
    const max = await db`SELECT MAX(end_time) AS max FROM tasks`;
    return {
      success: true,
      message: 'Got date range successfully',
      min: min[0].min,
      max: max[0].max
    };
  })


  .post('/createroom', async ({ body }: { body: { userId: number, task_id: number, roomName: string, task_title:string } }) => {
    const { userId, roomName, task_id, task_title } = body;
    const struserId = String(userId);
    const roomid = getroomId(userId, roomName)

    try {

      const room = await db`
          select * from rooms
          where roomid = ${roomid}`; ///RETURNING ใช้ได้กับคำสั่ง INSERT, UPDATE, หรือ DELETE เท่านั้น

      if (room.length === 0) {

        await db`
          insert into rooms (roomid,roomname, creater_id, member_id, task_title) 
          values (${roomid},${roomName}, ${userId}, ${struserId}, ${task_title})`;


        await db`update tasks set room_id = ${roomid}  where task_id = ${task_id}`;
        console.log("create successfully")

        return {
          success: true,
          message: 'create successfully',
          roomid: roomid
        };

      } else {
        console.log("already has this room");
      }


    } catch (e) {
      console.error(e, "create room unsuccessful");
      return {
        success: false,
        message: 'update unsuccessful',
      };

    }
  })

  .post('/updatesubstatus', async ({ body }: { body: { main: { detail_id: number, tasks: string, status: string, subtasks: Array<{ subtask: string, status: string, subtask_id: number }> }, sub: { subtask: string, status: string, subtask_id: number }, task_id: number } }) => {
    const { main, sub, task_id } = body;

    const status = (sub.status === 'completed') ? 'incomplete' : 'completed';

    await db`
       update task_subtasks
       set status =  ${status}
       where subtask_id = ${sub.subtask_id}`;

    let c = true;
    for (const i of main.subtasks) {
      if (i.subtask_id === sub.subtask_id) {
        i.status = status;
      }
      if (i.status === 'incomplete') {
        c = false;
        break;
      }
    }
    if (c) {
      await db`
       update task_details
       set status =  'completed'
       where detail_id = ${main.detail_id}`;
    } else {
      await db`
       update task_details
       set status = 'incomplete'
       where detail_id = ${main.detail_id}`;
    }
    return {
      success: true,
      message: 'update task successfully',
      task_id
    };


  })

  .get('/getfriendchat', async ({ query }) => {
    const userid = Number(query.userid);
    const friendid = Number(query.friendid)

    try {
      const result = await db`
       select * from personal_chat 
       where (sender_id = ${userid} and receiver_id = ${friendid}) or (sender_id = ${friendid} and receiver_id = ${userid})
       order by send_time asc`;

      return {
        success: true,
        message: 'get friend chat successful',
        chatmessage: result
      };

    } catch {
      console.log('get friend chat unsuccessful')
      return {
        success: false,
        message: 'get friend chat unsuccessful',
      };

    }
  })

  .get('/getroomchat', async ({ query }) => {
    const roomid = query.roomid;

    try {
      const room = await db`
       select * from room_chat 
       where room_id = ${roomid}
       order by send_time asc`;

      return {
        success: true,
        message: 'get room chat successful',
        chatmessage: room
      };

    } catch {
      console.log('get room chat unsuccessful')
      return {
        success: false,
        message: 'get room chat unsuccessful',
      };

    }
  })

  .listen(4000);

console.log('🟢 Elysia server running on http://localhost:4000');





const connections = new Map<string, ServerWebSocket<any>>();

function getroomId(userId: number, roomName: string): string {
  return btoa(`${userId}:${roomName}`);
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

    async message(ws, rawMessage) {
      let msg: any;

      try {
        const text = typeof rawMessage === 'string' ? rawMessage : rawMessage.toString('utf-8'); // แปลง Buffer เป็น string
        msg = JSON.parse(text);
      } catch (e) {
        ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
        return;
      }

      const { type } = msg;


      if (type === "room_message") {
        const { userId, message, roomId } = msg;

        try {
          const room = await db` select * from rooms where roomid = ${roomId}`;

          if (room.length === 0) {
            console.log("do not have this room");

          } else {

            const member = (room[0].member_id).split(',') //string
            const insert = await db`insert into room_chat (sender_id,room_id,chatmessage) values(${userId}, ${roomId}, ${message}) RETURNING *`;

            for (const friendId of member) {
              const friendSocket = connections.get(friendId);
              if (friendSocket && friendId != userId) {
                friendSocket.send(JSON.stringify({ type: 'room', roomchatid: insert[0].roomchatid, sender_id: userId, chatmessage: message, room_id: insert[0].room_id, send_time: insert[0].send_time }));
                //เมื่อส่งข้อมูลผ่านเครือข่าย (เช่น ผ่าน WebSocket, HTTP, API) เราต้องแปลงข้อมูลให้เป็น string ก่อน เพราะ protocol พวกนี้รับส่งข้อมูลแบบข้อความ (text) ฝั่งรับสามารถแปลง string นี้กลับเป็น object โดยใช้ JSON.parse() เพื่อใช้งานต่อได้
              }
              else {
                console.log('friend not online');
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

          const friend = await db`select * from users where userid = ${friendId}`;

          if (friend.length === 0) {
            console.log("do not have this friend");

          } else {

            const insert = await db`insert into personal_chat (sender_id,receiver_id,chatmessage) values(${userId}, ${friendId}, ${message}) RETURNING *`;

            const friendSocket = connections.get(`${friendId}`);
            if (friendSocket) {
              friendSocket.send(JSON.stringify({ type: 'friend', sender_id: userId, receiver_id: friendId, chatmessage: message, send_time: insert[0].send_time }));

            } else {

              console.log('friend not online');
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


  }

});

console.log('ws running at port 3000')
