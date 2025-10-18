import { Elysia, t } from "elysia";
import db from "./db";

const chatRoute = new Elysia({ prefix: "/chat" })

  .get("/friend", async ({ query, set }) => {
    //getfriendchat
    const userid = Number(query.userid);
    const friendid = Number(query.friendid);

    try {
      const result = await db`
         select * from personal_chat 
         where (sender_id = ${userid} and receiver_id = ${friendid}) or (sender_id = ${friendid} and receiver_id = ${userid})
         order by send_time asc`;

      set.status = 200;
      return {
        success: true,
        message: "get friend chat successful",
        chatmessage: result,
      };
    } catch (err) {
      set.status = 400;
      return {
        success: false,
        message: "get friend chat unsuccessful",
        error: err,
      };
    }
  })

  .get("/room", async ({ query, set }) => {
    const roomid = query.roomid;

    try {
      const room = await db`
         select * from room_chat 
         where room_id = ${roomid}
         order by send_time asc`;

      set.status = 200;
      return {
        success: true,
        message: "get room chat successful",
        chatmessage: room,
      };
      
    } catch (err) {

      console.log("get room chat unsuccessful");
      set.status = 400;
      return {
        success: false,
        message: "get room chat unsuccessful",
        error: err,
      };
    }
  });

export default chatRoute;
