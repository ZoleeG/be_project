const db = require("../db/connection");
const format = require("pg-format");
const { articleData } = require("../db/data/test-data");

exports.selectTopics = () => {
  const queryStr = `SELECT * FROM topics;`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  const regex = /\D/;
  const isNonDigit = regex.test(article_id);
  if (article_id <= 0 || isNonDigit) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const queryStr = `SELECT * FROM articles WHERE article_id=$1;`;
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};

exports.selectAllArticles = () => {
  const queryStr = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, article_img_url, COUNT(comments.article_id) AS comment_count, SUM(comments.votes) AS votes FROM articles JOIN comments ON articles.article_id=comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at;`;

  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.selectCommentsById = (article_id) => {
  const regex = /\D/;
  const isNonDigit = regex.test(article_id);
  if (article_id <= 0 || isNonDigit) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

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

exports.checkArticlesExists = () => {
  const queryStr = format(`SELECT * FROM articles;`);
  return db.query(queryStr).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
  });
};

exports.addCommentById = (newComment, article_id) => {
  const { username, body } = newComment;
  const regex = /\D/;
  const isNonDigit = regex.test(article_id);
  if (article_id <= 0 || isNonDigit) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  if (
    typeof username !== "string" ||
    username.toUpperCase() === username.toLowerCase()
  ) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  if (typeof body !== "string" || body.toUpperCase() === body.toLowerCase()) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  const queryStr = format(
    `INSERT INTO comments (body, author, article_id) VALUES %L RETURNING * ;`,
    [[body, username, article_id]]
  );
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};
