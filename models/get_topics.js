const db = require("../db/connection");
const format = require("pg-format");
const {articleData}=require("../db/data/test-data")


exports.selectTopics = () => {
      const queryStr = `SELECT * FROM topics;`
      return db.query(queryStr).then(({ rows }) => {
        return rows;
      });
}

exports.selectArticleById = (article_id) => {
    
    if (article_id<=0) {
        return Promise.reject({ status: 404, msg: "Invalid input, article_id cannot be zero or negative" })
    }
    const regex=/\D/
    const isNonDigit=regex.test(article_id)
    if(isNonDigit){
        return Promise.reject({ status: 404, msg: "Invalid input for type integer" })
    }
    if (article_id>articleData.length) {
        return Promise.reject({ status: 404, msg: "No id found, number too high" })
    }
    
    const queryStr = `SELECT * FROM articles WHERE article_id=$1;`
    return db.query(queryStr,[article_id]).then(({ rows }) => {
        if(rows.length===0){
            return Promise.reject({ status: 404, msg: "not found" });
        }
        return rows[0];
      });
}

exports.selectAllArticles = () => {
    const queryStr = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, article_img_url, COUNT(comments.article_id) AS comment_count, SUM(comments.votes) AS votes FROM articles JOIN comments ON articles.article_id=comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at;`
    
    return db.query(queryStr).then(({ rows }) => {
        if(rows.length===0){
            return Promise.reject({ status: 404, msg: "not found" });
        }
        return rows;
      });
}

exports.selectCommentsById = (article_id) => {

    const queryStr = format(`SELECT * FROM comments WHERE comments.article_id = %s ORDER BY comments.created_at DESC;`, article_id)
    
    return db.query(queryStr).then(({ rows }) => {
        return rows;
      });
}

exports.checkArticleExists = (article_id) => {
    const queryStr = format(`SELECT * FROM articles WHERE article_id = %s;`, article_id)
    return db.query(queryStr).then(({ rows }) => {
        if(rows.length===0){
            return Promise.reject({ status: 404, msg: "article not found" });
        }
      });
}