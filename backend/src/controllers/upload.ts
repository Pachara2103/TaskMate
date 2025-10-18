import { Elysia, t } from "elysia";
import db from "./db";
import { writeFileSync } from "fs";
import { join } from "path";

const uploadRoute = new Elysia().post(
  "/upload",
  async ({ body, set }) => {
    const { file, userid, roomid, type } = body;
    const intuserid = Number(userid);

    try {
      if (!file) {
        console.log("upload failed");
        return { success: false, message: "No file uploaded" };
      }
      const buffer = await file.arrayBuffer();
      let filename;

      if (type === "user") {
        filename = `${userid}.png`;
        await db`
        update users set profile  = ${userid} where userid = ${intuserid}`;
      } else if (type === "room") {
        filename = `${roomid}.png`;
        await db`
        update rooms set profile  = ${roomid} where roomid = ${roomid}`;
      }
      const filepath = join("./src/uploads", filename!);
      writeFileSync(filepath, Buffer.from(buffer));

      set.status = 200;
      return { success: true, message: "upload success", filename: filename };
    } catch (err) {
      set.status = 400;
      return { success: false, message: "upload failed", error: err };
    }
  },
  {
    body: t.Object({
      file: t.File({ format: "image/*" }),
      userid: t.String(),
      roomid: t.String(),
      type: t.String(),
    }),
  }
);

export default uploadRoute;
