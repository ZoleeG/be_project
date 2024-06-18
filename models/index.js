const db = require("../db/connection");
const format = require("pg-format");
const data = require("../db/data/test-data");

exports.selectTopics = () => {
  const queryStr = `SELECT * FROM topics;`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  const queryStr = `SELECT articles.article_id, title , topic, articles.author, articles.body, articles.created_at, articles.votes, article_img_url, COUNT(articles.article_id) AS comment_count FROM articles JOIN comments ON comments.article_id=articles.article_id WHERE comments.article_id=$1 GROUP BY articles.article_id;`;
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};

exports.selectAllArticles = (order = "DESC", sort_by = "created_at", topic) => {
  const queryValues = [];
  let queryStr =
    "SELECT articles.author, title, articles.article_id, topic, articles.created_at, article_img_url, COUNT(comments.article_id) AS comment_count, SUM(comments.votes) AS votes FROM articles JOIN comments ON articles.article_id=comments.article_id";

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $1`;
  }

  

  queryStr += " GROUP BY articles.article_id";

  queryStr += format(` ORDER BY %I %s ;`, sort_by, order);
  return db.query(queryStr, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.selectCommentsById = (article_id) => {
  const queryStr = `SELECT * FROM comments WHERE comments.article_id = $1 ORDER BY comments.created_at DESC;`;

  return db.query(queryStr, [article_id]).then(({ rows }) => {
    return rows;
  });
};

exports.checkArticleExists = (article_id) => {
  const queryStr = `SELECT * FROM articles WHERE article_id = $1 ;`;
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
  });
};

exports.addCommentById = (newComment, article_id) => {
  const { username, body } = newComment;

  const queryStr = format(
    `INSERT INTO comments (body, author, article_id) VALUES %L RETURNING * ;`,
    [[body, username, article_id]]
  );
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.updateVotesById = (instructions, article_id) => {
  const { inc_votes } = instructions;
  if (![-1, 1].includes(inc_votes)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  const increment = `votes+${inc_votes}`;

  const queryStr = format(
    `UPDATE articles SET votes=%s WHERE article_id=%s RETURNING * ;`,
    increment,
    article_id
  );
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.deleteCommentById = (comment_id) => {
  const queryStr = `DELETE FROM comments WHERE comment_id=$1 RETURNING *;`;
  return db
    .query(queryStr, [comment_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      const [obj] = rows;
      const comment_id2 = obj.comment_id;
      const queryStr2 = `SELECT * FROM comments WHERE comment_id=$1;`;
      return db.query(queryStr2, [comment_id2]);
    })
    .then(({ rows }) => {
      if (rows.length !== 0) {
        return Promise.reject({
          status: 418,
          msg: "Deleted but still exists. How is this possible?",
        });
      }
      return rows;
    });
};

exports.checkCommentExists = (comment_id) => {
  const queryStr = `SELECT * FROM comments WHERE comment_id=$1;`;
  return db.query(queryStr, [comment_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Comment not found" });
    }
  });
};

exports.selectAllUsers = (username) => {
  const queryValues = [];
  let queryStr =
    "SELECT * FROM users";

  if (username) {
    queryValues.push(username);
    queryStr += ` WHERE username = $1`;
  }
  return db.query(queryStr,queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.updateCommentVotesById = (instructions, comment_id) => {
  const { inc_votes } = instructions;
  if (![-1, 1].includes(inc_votes)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  const increment = `votes+${inc_votes}`;

  const queryStr = format(
    `UPDATE comments SET votes=%s WHERE comment_id=%s RETURNING * ;`,
    increment,
    comment_id
  );
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};
