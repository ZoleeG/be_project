const db = require("../db/connection");
const fs =require("fs/promises")

exports.selectTopics = () => {
      const queryStr = `SELECT * FROM topics;`
      return db.query(queryStr).then(({ rows }) => {
        return rows;
      });
}

