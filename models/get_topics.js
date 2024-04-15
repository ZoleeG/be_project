const db = require("../db/connection");
const fs =require("fs/promises")
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