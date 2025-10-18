import { Elysia, t } from "elysia";
import db from "./db";

const requestRoute = new Elysia({ prefix: "/request" })

  .get("/", async ({ query, set }) => {
    //getrequest
    const userid = Number(query.userid);
    try {
      // เช็คว่ามีคำขอ pending อยู่แล้วหรือไม่
      const result = await db`
      SELECT  r.requester_id as from_user,u.username as from_username, r.status, r.addressee_id AS to_user, u2.username as to_username
      from requests r
      join users u on u.userid = r.addressee_id
      join users u2 on u2.userid = r.requester_id
      where r.addressee_id = ${userid}`;

      set.status = 200;
      return { success: true, message: "request success", allusers: result };
    } catch (err) {
      set.status = 400;
      return { success: false, message: "request error", error: err };
    }
  })

  .post(
    //responserequest
    "/",
    async ({ body, set }) => {
      const { userid, friendid, type } = body;
      try {
        let result;
        if (type === "accept") {
          result =
            await db`insert into friends (user_id, friend_id) values (${userid}, ${friendid})`;
          await db`
              DELETE FROM requests 
              WHERE requester_id = ${friendid} AND addressee_id = ${userid} AND status = 'pending'`;
          // console.log("success accept friends")
        }

        if (type === "cancel") {
          result = await db`
        DELETE FROM requests 
        WHERE requester_id = ${userid} AND addressee_id = ${friendid} AND status = 'pending'`;
          console.log("cancel friends");
        }

        set.status = 200;
        return { success: true, message: "request success", allusers: result };
      } catch (err) {
        set.status = 400;
        return { success: true, message: "request error: " + err };
      }
    },
    {
      body: t.Object({
        userid: t.Number(),
        friendid: t.Number(),
        type: t.String(),
      }),
    }
  )

  .post(
    //friendrequest
    "/friend",
    async ({ body, set }) => {
      const { userid, friendid } = body;

      try {
        const result = await db`SELECT * FROM users WHERE userid = ${friendid}`;

        if (result.length === 0) {
          set.status = 404;
          return { success: false, message: "friend not found" };
        }
        // เช็คว่ามีคำขอ pending อยู่แล้วมั้ย
        const existing = await db`
         SELECT * FROM requests 
         WHERE requester_id = ${userid} AND addressee_id = ${friendid} AND status = 'pending'`;

        if (existing.length > 0) {
          //มีแล้ว ลบออก
          await db`
           DELETE FROM requests 
           WHERE requester_id = ${userid} AND addressee_id = ${friendid} AND status = 'pending'`;
        } else {
          // ถ้ายังไม่มี → เพิ่มคำขอใหม่
          await db`
        INSERT INTO requests  (requester_id, addressee_id, status)
        VALUES (${userid}, ${friendid}, 'pending')`;
        }

        set.status = 200;
        return { success: true, message: "action success" };
        
      } catch (err) {
        set.status = 400;
        return { success: false, message: "request error", error: err };
      }
    },
    {
      body: t.Object({
        userid: t.Number(),
        friendid: t.Number(),
      }),
    }
  );

export default requestRoute;
