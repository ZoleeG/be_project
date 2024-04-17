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
  const queryStr = `SELECT * FROM articles WHERE article_id=$1;`;
  return db.query(queryStr, [article_id]).then(({ rows }) => {
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
  const queryStr = `SELECT * FROM articles;`
  return db.query(queryStr).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
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
    if (![-100, 1].includes(inc_votes)) {
        return Promise.reject({ status: 400, msg: "Bad request" });
      }
    const increment=`votes+${inc_votes}`

    const queryStr = format(
      `UPDATE articles SET votes=%s WHERE article_id=%s RETURNING * ;`,increment, article_id)
    return db.query(queryStr).then(({ rows }) => {
      return rows;
    });
  };

  exports.deleteCommentById = (comment_id) => {
    const queryStr = 
      `DELETE FROM comments WHERE comment_id=$1 RETURNING *;`
    return db.query(queryStr,[comment_id])
    .then(({rows}) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      const [obj] = rows
      const comment_id2= obj.comment_id
      const queryStr2 = `SELECT * FROM comments WHERE comment_id=$1;`
    return db.query(queryStr2, [comment_id2])
    })
    .then(({rows})=>{
      if (rows.length !== 0) {
        return Promise.reject({ status: 418, msg: "Deleted but still exists. How is this possible?" });
      }
      return rows
    })
  };

  exports.checkCommentExists = (comment_id) => {
    const queryStr = `SELECT * FROM comments WHERE comment_id=$1;`;
    return db.query(queryStr,[comment_id]).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
  };

  exports.selectAllUsers = () => {
    const queryStr = `SELECT username, name, avatar_url FROM users;`;
    return db.query(queryStr).then(({ rows }) => {
      return rows;
    });
  };