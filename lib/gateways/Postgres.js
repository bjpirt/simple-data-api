function init(db) {
  let Postgres = {
    createGroup: async (name) => {
      const insertGroupQuery = 'INSERT INTO groups (name) VALUES ($(name)) RETURNING id, name, created_at';
      return await db.one(insertGroupQuery, { name });
    },

    listGroups: async () => {
      const selectGroupsQuery = 'SELECT * FROM groups ORDER BY id';
      return await db.any(selectGroupsQuery);
    },

    getGroup: async (id) => {
      const selectGroupQuery = 'SELECT * FROM groups WHERE id = $(id)';
      return await db.one(selectGroupQuery, { id });
    },

    findOrCreateReading: async (group_id, name) => {
      try{
        return await db.one(
          'SELECT * FROM readings WHERE group_id = $(group_id) AND name = $(name)',
          { group_id, name }
        );
      }catch(err){
        return await db.one(
          'INSERT INTO readings (group_id, name) VALUES ($(group_id), $(name)) RETURNING (id)',
          { group_id, name }
        );
      }
    },

    insertValue: async (reading_id, time, value) => {
      await db.any(
        'INSERT INTO values (reading_id, time, value) VALUES ($(reading_id), $(time), $(value)) ON CONFLICT (reading_id, time) DO UPDATE SET value = EXCLUDED.value',
        { reading_id, time, value }
      );
    },

    listReadings: async (group_id) => {
      return await db.any(
        `SELECT DISTINCT ON (reading_id)
          reading_id,
          readings.name as name,
          time as lastValueTime,
          value as lastValue
        FROM
        VALUES
          JOIN readings ON values.reading_id = readings.id
        WHERE
          readings.group_id = $(group_id)
        ORDER BY
          reading_id,
          time DESC;`,
        { group_id }
      );
    },

    createBulkReadings: async (group_id, readings) => {
      const reading_names = Object.keys(readings);
      for(let i=0; i< reading_names.length; i++){
        let reading = readings[reading_names[i]]
        let existing = await Postgres.findOrCreateReading(group_id, reading_names[i]);
        for(let v=0; v< reading.length; v++){
          if(reading[v].value !== null){
            await Postgres.insertValue(existing.id, reading[v].time, reading[v].value);
          }
        }
      }
    },

    getValues: async (group_id, reading_name, options) => {
      let whereStatements = [];
      let whereConds = {};

      if(options.start){
        whereConds.start = options.start;
        whereStatements.push(`values.time >= $(start)`);
      }
      if(options.end){
        whereConds.end = options.end;
        whereStatements.push(`values.time < $(end)`);
      }

      let whereClause = whereStatements.length > 0 ? ` AND ${whereStatements.join(' AND ')} ` : ''

      let query =
        `SELECT
          values.time,
          values.value
        FROM
          values
          JOIN readings ON readings.id = values.reading_id
          JOIN GROUPS ON groups.id = readings.group_id
        WHERE
          groups.id = $(group_id)
          AND readings.name = $(reading_name) ${whereClause}
        ORDER BY
          values.time ASC`;

      if(options.interval){
        query =
          `SELECT to_timestamp(t) as time, value FROM (SELECT
            (CAST(extract(epoch FROM time) AS INTEGER) - (CAST(extract(epoch FROM time) AS INTEGER) % $(interval) )) AS t,
            AVG(value) AS value
          FROM
            values
          JOIN readings ON readings.id = values.reading_id
          JOIN GROUPS ON groups.id = readings.group_id
          WHERE
            groups.id = $(group_id)
            AND readings.name = $(reading_name) ${whereClause}
          GROUP BY
            t
          ORDER BY
            t ASC) q`;
        whereConds.interval = options.interval;
      }

      return await db.any(query, { group_id, reading_name, ...whereConds });
    }
  };
  return Postgres;
}

module.exports = init;