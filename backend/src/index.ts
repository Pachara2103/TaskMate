import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import startWebSocket from "./websocket";

import authRoute from "./controllers/auth";
import loginRoute from "./controllers/login";
import taskRoute from "./controllers/task";
import chatRoute from "./controllers/chat";
import friendRoute from "./controllers/friend";
import requestRoute from "./controllers/request";
import roomRoute from "./controllers/room";
import uploadRoute from "./controllers/upload";
import userRoute from "./controllers/user";

const app = new Elysia()

  .use(
    cors({
      origin: process.env.WEB_URL,
      credentials: true, // sent cookies
    })
  )
  .use(
    staticPlugin({
      prefix: "/uploads",
      assets: "./src/uploads",
    })
  )
  .use(authRoute)
  .use(chatRoute)
  .use(friendRoute)
  .use(loginRoute)
  .use(requestRoute)
  .use(roomRoute)
  .use(taskRoute)
  .use(uploadRoute)
  .use(userRoute)

  .listen(4000, () => {
    console.log("🟢 Elysia server running on port 4000");
  });

startWebSocket();
