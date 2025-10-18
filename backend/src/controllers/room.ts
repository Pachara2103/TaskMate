import { Elysia, t } from "elysia";
import db from "./db";

function getroomId(userId: number, roomName: string): string {
  return btoa(`${userId}:${roomName}`);
}

const roomRoute = new Elysia({ prefix: "/room" })

  .get("/", async ({ query, set }) => {
    //getallrooms

    try {
      const userid = query.userid;
      const result =
        await db`SELECT * FROM rooms WHERE ${userid} = ANY (string_to_array(member_id, ','));`;
      set.status = 200;
      return {
        success: true,
        message: "Fetched all rooms and statuses",
        allrooms: result,
      };
    } catch (err) {
      set.status = 400;
      return {
        success: false,
        message: err,
      };
    }
  })

  .post(
    //createroom
    "/",
    async ({ body, set }) => {
      const { userId, roomName, task_id, task_title } = body;
      const struserId = String(userId);
      const roomid = getroomId(userId, roomName);

      try {
        const room = await db`
          select * from rooms
          where roomid = ${roomid}`; ///RETURNING ใช้ได้กับคำสั่ง INSERT, UPDATE, หรือ DELETE เท่านั้น

        if (room.length === 0) {
          const newRoom = await db`
          insert into rooms (roomid,roomname, creater_id, member_id, task_title) 
          values (${roomid},${roomName}, ${userId}, ${struserId}, ${task_title})
          returning *`;

          await db`update tasks set room_id = ${roomid}  where task_id = ${task_id}`;
          console.log("create successfully");

          set.status = 200;
          return {
            success: true,
            message: "create room successfully",
            roomid: roomid,
            data: newRoom,
          };
        } else {
          console.log("already has this room");
          set.status = 400;
          return {
            success: true,
            message: "create room successfully",
          };
        }
      } catch (err) {
        set.status = 500;
        return {
          success: false,
          error: err,
        };
      }
    },
    {
      body: t.Object({
        userId: t.Number(),
        task_id: t.Number(),
        roomName: t.String(),
        task_title: t.String(),
      }),
    }
  );

export default roomRoute;
