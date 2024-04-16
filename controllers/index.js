const {selectTopics, selectArticleById, selectAllArticles, selectCommentsById, checkArticleExists, checkArticlesExists, addCommentById} = require('../models')

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
}

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params
    selectArticleById(article_id).then((article) => {
        res.status(200).send({ article });
    })
    .catch(next);
}

exports.getAllArticles = (req, res, next) => {
    Promise.all([selectAllArticles(), checkArticlesExists()])
    .then(([articles]) => {
        res.status(200).send({ articles });
    })
    .catch(next);
}

exports.getCommentsById = (req, res, next) => {
    const {article_id} = req.params
    Promise.all([selectCommentsById(article_id), checkArticleExists(article_id)])
    .then(([comments]) => {
        res.status(200).send({ comments });
    })
    .catch(next);
}

exports.postCommentById = (req, res, next) => {
    const {body} = req
    const {article_id} = req.params
    addCommentById(body,article_id)
    .then((newComment) => {
        res.status(201).send({ newComment });
    })
    .catch(next);
}

