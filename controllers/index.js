const {
  selectTopics,
  selectArticleById,
  selectAllArticles,
  selectCommentsById,
  checkArticleExists,
  addCommentById,
  updateVotesById,
  deleteCommentById,
  checkCommentExists,
  selectAllUsers,
  updateCommentVotesById,
  addNewArticle,
} = require("../models");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([selectArticleById(article_id), checkArticleExists(article_id)])
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getAllArticles = (req, res, next) => {
  const {order, sort_by, topic, limit, p} = req.query
  selectAllArticles(order, sort_by, topic, limit, p)
    .then((articles) => {
      res.status(200).send({articles});
    })
    .catch(next);
};

exports.getCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([selectCommentsById(article_id), checkArticleExists(article_id)])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentById = (req, res, next) => {
  const { body } = req;
  const { article_id } = req.params;
  addCommentById(body, article_id)
    .then((newComment) => {
      res.status(201).send({ newComment });
    })
    .catch(next);
};

exports.patchVotesById = (req, res, next) => {
  const { body } = req;
  const { article_id } = req.params;
  Promise.all([
    updateVotesById(body, article_id),
    checkArticleExists(article_id),
  ])
    .then(([updatedArticle]) => {
      res.status(200).send({ updatedArticle });
    })
    .catch(next);
};

exports.removeCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentById(comment_id)
    .then((rows) => {
      res.status(204).send(rows);
    })
    .catch(next);
};

exports.getAllUsers = (req, res, next) => {
  const {username} = req.query
  selectAllUsers(username)
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.patchCommentVotesById = (req, res, next) => {
  const { body } = req;
  const { comment_id } = req.params;
  Promise.all([
    updateCommentVotesById(body, comment_id),
    checkCommentExists(comment_id),
  ])
    .then(([updatedComment]) => {
      res.status(200).send({ updatedComment });
    })
    .catch(next);
};

exports.postNewArticle = (req, res, next) => {
  const { body } = req;
  addNewArticle(body)
    .then((newArticle) => {
      res.status(201).send({ newArticle });
    })
    .catch(next);
};
