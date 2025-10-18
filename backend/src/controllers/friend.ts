import { Elysia, t } from "elysia";
import db from "./db";

const friendRoute = new Elysia({ prefix: "/friend" }).get(
  "/",
  async ({ query, set }) => {
    //getallfriends
    const userid = Number(query.userid);

    try {
      const result = await db`
    SELECT u.userid as friend_id, u.username as friend_name, u.profile
    FROM friends f
    JOIN users u ON u.userid = 
      CASE 
        WHEN f.user_id = ${userid} THEN f.friend_id
        ELSE f.user_id
      END
    WHERE f.user_id = ${userid} OR f.friend_id = ${userid};`;

      set.status = 200;
      return {
        success: true,
        message: "Fetched all friend and statuses",
        allfriends: result,
      };
      
    } catch (err) {

      set.status = 400;
      return {
        success: false,
        message: "Request error",
      };
    }
  }
);

export default friendRoute;
