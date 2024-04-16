const app = require("../app");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const { convertTimestampToDate } = require("../db/seeds/utils");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  it("GET: 200 should respond with an array of topic objects each with two attributes: slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});
describe("Error: invalid_path", () => {
  it("GET: 404 should respond with an error when the url is incorrect", () => {
    return request(app)
      .get("/api/twopics")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid path");
      });
  });
});
describe("GET /api", () => {
  it("GET: 200 should respond with an object describing all the available endpoints on our API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const expected = endpoints;
        const { body } = response;
        expect(body).toMatchObject(expected);
      });
  });
});
describe("GET /api/articles/:article_id", () => {
  it("GET 200: should respond with an article object with the following attributes: author, title, article_id, body, topic, created_at, votes, article_img_url", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const expected = {
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        const { body } = response;
        const actual = body.article;
        expect(actual).toMatchObject(expected);
      });
  });
  describe("GET 400: should respond with a 'bad request' error if the input parameter is invalid", () => {
    it("if it is a negative number or zero", () => {
      return request(app)
        .get("/api/articles/-50")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
    it("if not a number", () => {
      return request(app)
        .get("/api/articles/hi")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
    it("if not an integer number", () => {
      return request(app)
        .get("/api/articles/3.14")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
  describe("GET 404: correct form of input but too high", () => {
    it("if the input number is too high", () => {
      return request(app)
        .get("/api/articles/1116")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article not found");
        });
    });
  });
});
describe("GET /api/articles", () => {
  it("GET 200: should serve an array of all articles, where each has the following attributes: author, title, article_id, topic, created_at, votes, article_img_url, comment_count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const length = articles.length;

        expect(length).toBe(5);

        articles.forEach((article) => {
          expect(Object.keys(article).length).toBe(8);
          expect(Object.keys(article)).toEqual([
            "author",
            "title",
            "article_id",
            "topic",
            "created_at",
            "article_img_url",
            "comment_count",
            "votes",
          ]);
          const {
            author,
            title,
            article_id,
            topic,
            created_at,
            votes,
            article_img_url,
            comment_count,
          } = article;
          expect(typeof author).toBe("string");
          expect(typeof title).toBe("string");
          expect(typeof article_id).toBe("number");
          expect(typeof topic).toBe("string");
          expect(typeof created_at).toBe("string");
          expect(typeof votes).toBe("string");
          expect(typeof article_img_url).toBe("string");
          expect(typeof comment_count).toBe("string");
        });
      });
  });
  it("they need to be sorted by created_at date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const length = articles.length;
        expect(length).toBe(5);

        const expectedSortBy = "created_at";
        const expectedOrder = { descending: true, coerce: true };
        expect(articles).toBeSortedBy(expectedSortBy, expectedOrder);
      });
  });
  it("there should not be a body property present on any of the article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const actual = articles[2];
        const expected = {
          article_id: 5,
          title: "UNCOVERED: catspiracy to bring down democracy",
          topic: "cats",
          author: "rogersop",
          created_at: "2020-08-03T13:14:00.000Z",
          votes: "17",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: "2",
        };
        expect(actual).toEqual(expected);
      });
  });
});
describe("GET /api/articles/:article_id/comments", () => {
  it("GET 200: should respond with an array of comments for the given article_id, where each comment should have the following properties: comment_id, votes, created_at, author, body, article_id", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { comments } = body;
        const length = comments.length;

        expect(length).toBe(2);

        comments.forEach((comment) => {
          expect(Object.keys(comment).length).toBe(6);
          expect(Object.keys(comment)).toEqual(['comment_id', 'body', 'article_id', 'author', 'votes', 'created_at']);
          const { comment_id, votes, created_at, author, body, article_id } =
            comment;
          expect(typeof comment_id).toBe("number");
          expect(typeof votes).toBe("number");
          expect(typeof created_at).toBe("string");
          expect(typeof author).toBe("string");
          expect(typeof body).toBe("string");
          expect(typeof article_id).toBe("number");
        });
      });
  });
  it("the comments should be sorted by their created_at attribute in descending order", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { comments } = body;
        const actual = comments;
        const expectedSortBy = "created_at";
        const expectedOrder = { descending: true, coerce: true };
        expect(actual).toBeSortedBy(expectedSortBy, expectedOrder);
      });
  });
  it("GET 200: should respond with an empty array when the given article exists but has no comment", () => {
    return request(app)
      .get("/api/articles/8/comments")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { comments } = body;

        expect(comments.length).toBe(0);
      });
  });
  it("GET 404: not found if article does not exists", () => {
    return request(app)
      .get("/api/articles/1113/comments")
      .expect(404)
      .then((response) => {
        const { body } = response;
        const { msg } = body;

        expect(msg).toBe("Article not found");
      });
  });
  it('GET 400: bad request if request is of incorrect datatype', () => {
    return request(app)
      .get("/api/articles/onetwothree/comments")
      .expect(400)
      .then((response) => {
        const { body } = response;
        const { msg } = body;

        expect(msg).toBe("Bad request");
      });
  });
});
describe('POST /api/articles/:article_id/comments', () => {
  it('POST 201: adds comment to an article and responds with the posted comment', () => {
    const inputBody = {
      username: "lurker",
      body: "Excellent work from the author"
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(inputBody)
      .expect(201)
      .then(({ body }) => {
        const { newComment } = body;
        const expected = {
          body: "Excellent work from the author",
          article_id: 2,
          author: 'lurker'
        }
        expect(...newComment).toMatchObject(expected);
      });
  });
  it('POST 400: if the inputBody is not in the correct form', () => {
    const inputBody = {
      username: 'fgf',
      body: "Excellent work"
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request")
      });
  });
});
describe('PATCH /api/articles/:article_id', () => {
  it('PATCH 200: should update the selected article in accordance with the input body, where { inc_votes : 1 } would increment the current article\'s vote property by 1', () => {
    const inputBody = {
      inc_votes: 1
    };
    return request(app)
      .patch("/api/articles/2")
      .send(inputBody)
      .expect(200)
      .then(({ body }) => {
        const { updatedArticle } = body;
        const expected = {
        article_id: 2,
        title: 'Sony Vaio; or, The Laptop',
        votes: 1
      }
        expect(...updatedArticle).toMatchObject(expected);
      });
  });
  it('PATCH 200: { inc_votes : -100 } would decrement the current article\'s vote property by 100', () => {
    const inputBody = {
      inc_votes: -100
    };
    return request(app)
      .patch("/api/articles/2")
      .send(inputBody)
      .expect(200)
      .then(({ body }) => {
        const { updatedArticle } = body;
        const expected = {
        article_id: 2,
        title: 'Sony Vaio; or, The Laptop',
        votes: -100
      }
        expect(...updatedArticle).toMatchObject(expected);
      });
  });
  it('PATCH 400: bad request error is thrown if inc_votes different from -100 or 1', () => {
    const inputBody = {
      inc_votes: "1"
    };
    return request(app)
      .patch("/api/articles/2")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request")
      });
  });
});
