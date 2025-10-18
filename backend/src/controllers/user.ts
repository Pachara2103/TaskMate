import { Elysia, t } from "elysia";
import db from "./db";

const userRoute = new Elysia({ prefix: "/user" }).get(
  "/",
  async ({ query, set }) => {
    //getalluser
    const userid = Number(query.userid);
    const username = query.username;

    try {
      let result;
      if (username.trim() === "") {
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
   WHERE u.userid != ${userid} AND u.username ILIKE ${username + "%"}`;
      }

      set.status = 200;
      return {
        success: true,
        message: "Fetched all users and statuses successfully",
        allusers: result,
      };
    } catch (err) {

      set.status = 500;
      return {
        success: false,
        message: "Request error",
        error: err,
      };
    }
  }
);

export default userRoute;
