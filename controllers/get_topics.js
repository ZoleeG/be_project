const {selectTopics} = require('../models/get_topics')

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
}

