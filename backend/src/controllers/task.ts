import { Elysia, t } from "elysia";
import db from "../controllers/db";
import { getTasksQuery } from "../queries/taskSQL";

interface Subtask {
  subtask: string;
  status: string;
}

interface Detail {
  detail_id: number;
  tasks: string;
  status: string;
  subtasks: Subtask[];
}

const taskRoute = new Elysia({ prefix: "/task" })
  .get("/", async ({ query, set }) => {
    const userId = Number(query.userid);
    const type = query.type;
    let raw = [];
    let values: any[] = [];

    try {
      if (type === "My task") {
        values = [userId];
      } else {
        values = [query.userid, userId];
      }

      raw = await db.unsafe(getTasksQuery(type), values);

      const taskMap = new Map();

      for (const row of raw) {
        const {
          task_id,
          title,
          description,
          category,
          type,
          room_id,
          room_name,
          bookmark,
          start_time,
          end_time,
          detail_id,
          task_title,
          detail_status,
          subtask,
          subtask_status,
          subtask_id,
        } = row;

        if (!taskMap.has(task_id)) {
          taskMap.set(task_id, {
            task_id,
            title,
            description,
            category,
            type,
            room_id,
            room_name,
            bookmark,
            start_time,
            end_time,
            detail: [],
          });
        }

        const task = taskMap.get(task_id);

        let detailGroup = task.detail.find((g: Detail[]) =>
          g.some(
            (d) =>
              d.tasks === task_title &&
              d.status === detail_status &&
              d.detail_id === detail_id
          )
        );
        if (!detailGroup) {
          detailGroup = [
            {
              detail_id: detail_id,
              tasks: task_title,
              status: detail_status,
              subtasks: [],
            },
          ];
          task.detail.push(detailGroup);
        }

        const detail = detailGroup.find(
          (d: Detail) => d.tasks === task_title && d.status === detail_status
        );

        if (subtask) {
          if (!detail.subtasks.some((s: Subtask) => s.subtask === subtask)) {
            detail.subtasks.push({
              subtask,
              status: subtask_status,
              subtask_id,
            });
          }
        }
      }

      set.status = 200;
      return {
        success: true,
        message: "request success",
        amount: Array.from(taskMap.values()).length,
        alltasks: Array.from(taskMap.values()),
      };
    } catch (err) {
      set.status = 500;
      return { success: false, message: "request error", error: err };
    }
  })

  .post(
    "/",
    async ({ body, set }) => {
      const {
        userid,
        title,
        description,
        category,
        start_time,
        end_time,
        type_task,
        main_task,
        sub_task,
      } = body;
      try {
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

        set.status = 200;
        return {
          success: true,
          message: "Added task successfully",
        };
      } catch (err) {
        set.status = 500;
        return {
          success: false,
          message: err,
        };
      }
    },
    {
      body: t.Object({
        userid: t.Number(),
        title: t.String(),
        description: t.String(),
        category: t.String(),
        start_time: t.Date(),
        end_time: t.Date(),
        type_task: t.String(),
        main_task: t.Array(t.String()),
        sub_task: t.Array(t.Array(t.String())),
      }),
    }
  )

  .post(
    "/updatemainstatus",
    async ({ body, set }) => {
      try {
        const { update_task, task_id } = body;
        const status =
          update_task.status === "completed" ? "incomplete" : "completed";

        await db`
       update task_details
       set status =  ${status}
       where detail_id = ${update_task.detail_id}`;

        for (const s of update_task.subtasks) {
          if (status === "completed") {
            await db`
           update task_subtasks
           set status =  ${status}
           where detail_id = ${update_task.detail_id}`;
          } else {
            await db`
           update task_subtasks
           set status =  ${status}
           where detail_id = ${update_task.detail_id}`;
          }
        }
        set.status = 200;
        return {
          success: true,
          message: "update task successfully",
          task_id,
        };
      } catch (err) {
        set.status = 500;
        return {
          success: false,
          message: "request error",
          error: err,
        };
      }
    },
    {
      body: t.Object({
        update_task: t.Object({
          detail_id: t.Number(),
          tasks: t.String(),
          status: t.String(),
          subtasks: t.Array(
            t.Object({
              subtask: t.String(),
              status: t.String(),
            })
          ),
        }),
        task_id: t.Number(),
        ismain: t.Boolean(),
      }),
    }
  )

  .post(
    "/updatebookmark",
    async ({ body, set }) => {
      try {
        const { ismark, task_id } = body;
        await db`
       update tasks
       set bookmark = ${ismark}
       where task_id = ${task_id}`;

        set.status = 200;
        return {
          success: true,
          message: "update bookmark successfully",
        };
      } catch (err) {
        set.status = 200;
        return {
          success: true,
          error: err,
        };
      }
    },
    {
      body: t.Object({
        ismark: t.Boolean(),
        task_id: t.Number(),
      }),
    }
  )

  .post(
    "/updatesubstatus",
    async ({ body, set }) => {
      try {
        const { main, sub, task_id } = body;
        const status = sub.status === "completed" ? "incomplete" : "completed";

        await db`
         update task_subtasks
         set status =  ${status}
         where subtask_id = ${sub.subtask_id}`;

        let c = true;
        for (const i of main.subtasks) {
          if (i.subtask_id === sub.subtask_id) {
            i.status = status;
          }
          if (i.status === "incomplete") {
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
        set.status = 200;
        return {
          success: true,
          message: "update task successfully",
          task_id,
        };
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
        main: t.Object({
          detail_id: t.Number(),
          tasks: t.String(),
          status: t.String(),
          subtasks: t.Array(
            t.Object({
              subtask: t.String(),
              status: t.String(),
              subtask_id: t.Number(),
            })
          ),
        }),
        sub: t.Object({
          subtask: t.String(),
          status: t.String(),
          subtask_id: t.Number(),
        }),
        task_id: t.Number(),
      }),
    }
  )

  .get("/daterange", async ({ set }) => {
    try {
      const min = await db`SELECT MIN(start_time) AS min FROM tasks`;
      const max = await db`SELECT MAX(end_time) AS max FROM tasks`;

      set.status = 200;
      return {
        success: true,
        message: "Got date range successfully",
        min: min[0].min,
        max: max[0].max,
      };
    } catch (err) {
      set.status = 400;
      return {
        success: false,
        message: err,
      };
    }
  })

  .delete(
    "/",
    async ({ body, set }) => {
      try {
        const { task_id } = body;
        await db`
       delete from tasks where task_id = ${task_id}`;

        set.status = 200;
        return {
          success: true,
          message: "delete successfully",
        };
      } catch (err) {
        
        set.status = 500;
        return {
          success: true,
          error: err,
        };
      }
    },
    {
      body: t.Object({ task_id: t.Number() }),
    }
  );

export default taskRoute;
