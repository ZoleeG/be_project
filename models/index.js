const db = require("../db/connection");
const format = require("pg-format");
const data = require("../db/data/test-data");

exports.default_article_img_url="https://images.pexels.com/photos/159868/lost-cat-tree-sign-fun-159868.jpeg?w=700&h=700"

exports.selectTopics = () => {
  const queryStr = `SELECT * FROM topics;`;
  return db.query(queryStr).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  const queryStr = `SELECT articles.*, COUNT(comments.article_id)::int AS comment_count FROM articles LEFT JOIN comments ON comments.article_id=articles.article_id WHERE articles.article_id=$1 GROUP BY articles.article_id;`;
  return db.query(queryStr, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
};

exports.selectAllArticles = (order = "DESC", sort_by = "created_at", topic, limit=10, p=1) => {
  const skipThisManyArticles=(p-1)*limit
  const thisManyArticlesToDiscount=p*limit
  const queryValues = [];
  let queryStr =format(
    `SELECT articles.author, title, articles.article_id, topic, articles.created_at, article_img_url, COUNT(comments.article_id) AS comment_count, COALESCE(SUM(comments.votes),0) AS votes, (COUNT(*) OVER() - %s) AS total_count FROM articles LEFT JOIN comments ON articles.article_id=comments.article_id`, thisManyArticlesToDiscount);

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $1`
  }

  queryStr += " GROUP BY articles.article_id";

  queryStr += format(` ORDER BY %I %s %s %s;`, sort_by, order, `LIMIT ${limit}`, `OFFSET ${skipThisManyArticles}`);

  return db.query(queryStr, queryValues).then(({rows}) => {
    return rows;
  });
};

exports.selectCommentsById = (article_id, limit=10, p=1) => {
  const skipThisManyArticles=(p-1)*limit
  const queryStr = `SELECT * FROM comments WHERE comments.article_id = $1 ORDER BY comments.created_at DESC LIMIT $2 OFFSET $3;`;

  return db.query(queryStr, [article_id, limit, skipThisManyArticles]).then(({ rows }) => {
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
  let queryStr = "SELECT * FROM users";

  if (username) {
    queryValues.push(username);
    queryStr += ` WHERE username = $1`;
  }
  return db.query(queryStr, queryValues).then(({ rows }) => {
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

exports.addNewArticle = ({ author, title, body, topic, article_img_url=this.default_article_img_url}) => {

  const queryStr = format(
    `INSERT INTO articles (author, title, body, topic, article_img_url) VALUES %L RETURNING *, article_id, created_at;`,
    [[author, title, body, topic, article_img_url]]
  );
  return db
    .query(queryStr)
    .then(({ rows }) => {
      const [actual] = rows;
      const { article_id } = actual;
      const queryStr = `SELECT articles.article_id, title, topic, articles.author, articles.body, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON comments.article_id=articles.article_id WHERE articles.article_id=$1 GROUP BY articles.article_id;`;
      return db.query(queryStr, [article_id])
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.addNewTopic = ({ slug, description }) => {

  const queryStr = format(
    `INSERT INTO topics (slug, description) VALUES %L RETURNING *;`,
    [[ slug, description ]]
  );
  return db
    .query(queryStr)
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Topic not found" });
      }
      return rows[0];
    });
};

exports.deleteArticleById = (article_id) => {
  const queryStr = `DELETE FROM articles WHERE articles.article_id=$1 RETURNING *;`;
  return db
    .query(queryStr, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      const [obj] = rows;
      const article_id2 = obj.article_id;
      const queryStr2 = `SELECT * FROM articles WHERE article_id=$1;`;
      return db.query(queryStr2, [article_id2]);
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
