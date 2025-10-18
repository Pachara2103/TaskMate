export const getTasksQuery = (type: string) => {
  if (type === "All") {
    return `
      SELECT t.task_id, t.title, t.description, t.category, 
             t.type_task AS type, t.room_id, t.room_name, 
             t.bookmark, t.start_time, t.end_time, 
             d.detail_id, d.task_title, d.status AS detail_status, 
             s.subtask, s.status AS subtask_status, s.subtask_id
      FROM tasks t
      JOIN task_details d ON t.task_id = d.task_id
      LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
      LEFT JOIN rooms r ON t.room_id = r.roomid
      WHERE $1 = ANY (string_to_array(r.member_id, ',')) 
         OR t.from_user_id = $2
      ORDER BY t.start_time, t.end_time ASC;
    `;
  }

  if (type === "My task") {
    return `
      SELECT t.task_id, t.title, t.description, t.category, 
             t.type_task AS type, t.room_id, t.room_name, 
             t.bookmark, t.start_time, t.end_time, 
             d.detail_id, d.task_title, d.status AS detail_status, 
             s.subtask, s.status AS subtask_status, s.subtask_id
      FROM tasks t
      JOIN task_details d ON t.task_id = d.task_id
      LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
      WHERE t.from_user_id = $1 
        AND t.type_task = 'personal'
      ORDER BY t.task_id, d.detail_id, s.subtask_id ASC;
    `;
  }

  if (type === "Team task") {
    return `
      SELECT t.task_id, t.title, t.description, t.category, 
             t.type_task AS type, t.room_id, t.room_name, 
             t.bookmark, t.start_time, t.end_time, 
             d.detail_id, d.task_title, d.status AS detail_status, 
             s.subtask, s.status AS subtask_status, s.subtask_id
      FROM tasks t
      JOIN task_details d ON t.task_id = d.task_id
      LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
      LEFT JOIN rooms r ON t.room_id = r.roomid
      WHERE t.type_task = 'team'
        AND ($1 = ANY (string_to_array(r.member_id, ',')) OR t.from_user_id = $2)
      ORDER BY t.task_id, d.detail_id, s.subtask_id ASC;
    `;
  }

  if (type === "Deadline") {
    return `
      SELECT t.task_id, t.title, t.description, t.category, 
             t.type_task AS type, t.room_id, t.room_name, 
             t.bookmark, t.start_time, t.end_time, 
             d.detail_id, d.task_title, d.status AS detail_status, 
             s.subtask, s.status AS subtask_status, s.subtask_id
      FROM tasks t
      JOIN task_details d ON t.task_id = d.task_id
      LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
      LEFT JOIN rooms r ON t.room_id = r.roomid
      WHERE $1 = ANY (string_to_array(r.member_id, ',')) OR t.from_user_id = $2
      ORDER BY t.end_time ASC;
    `;
  }

  if (type === "Completed") {
    return `
      SELECT t.task_id, t.title, t.description, t.category, 
             t.type_task AS type, t.room_id, t.room_name, 
             t.bookmark, t.start_time, t.end_time, 
             d.detail_id, d.task_title, d.status AS detail_status, 
             s.subtask, s.status AS subtask_status, s.subtask_id
      FROM tasks t
      JOIN task_details d ON t.task_id = d.task_id
      LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
      LEFT JOIN rooms r ON t.room_id = r.roomid
      WHERE ($1 = ANY (string_to_array(r.member_id, ',')) OR t.from_user_id = $2)
        AND NOT EXISTS (
          SELECT 1 FROM task_details td 
          WHERE td.task_id = t.task_id AND td.status != 'completed'
        )
        AND NOT EXISTS (
          SELECT 1 FROM task_details td
          JOIN task_subtasks st ON st.detail_id = td.detail_id
          WHERE td.task_id = t.task_id AND st.status != 'completed'
        )
      ORDER BY t.end_time ASC;
    `;
  }

  if (type === "Fav") {
    return `
      SELECT t.task_id, t.title, t.description, t.category, 
             t.type_task AS type, t.room_id, t.room_name, 
             t.bookmark, t.start_time, t.end_time, 
             d.detail_id, d.task_title, d.status AS detail_status, 
             s.subtask, s.status AS subtask_status, s.subtask_id
      FROM tasks t
      JOIN task_details d ON t.task_id = d.task_id
      LEFT JOIN task_subtasks s ON d.detail_id = s.detail_id
      LEFT JOIN rooms r ON t.room_id = r.roomid
      WHERE t.bookmark = true
        AND ($1 = ANY (string_to_array(r.member_id, ',')) OR t.from_user_id = $2)
      ORDER BY t.end_time ASC;
    `;
  }

  throw new Error(`Unknown task type: ${type}`);
};
