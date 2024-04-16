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
  describe("GET 404: should respond with an error if the input parameter is invalid", () => {
    it("if it is a negative number or zero", () => {
      return request(app)
        .get("/api/articles/-50")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe(
            "Invalid input, article_id cannot be zero or negative"
          );
        });
    });
    it("if not a number", () => {
      return request(app)
        .get("/api/articles/hi")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Invalid input for type integer");
        });
    });
    it("if not an integer number", () => {
      return request(app)
        .get("/api/articles/3.14")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Invalid input for type integer");
        });
    });
  });
  describe("GET 404: correct form of input but too high", () => {
    it("if the input number is too high", () => {
      return request(app)
        .get("/api/articles/1116")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("No id found, number too high");
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
        const {articles} = body
        const actual = articles[2];
        const expected = {
          article_id: 5,
          title: "UNCOVERED: catspiracy to bring down democracy",
          topic: "cats",
          author: "rogersop",
          created_at: '2020-08-03T13:14:00.000Z',
          votes: '17',
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: '2',
        };
        expect(actual).toMatchObject(expected);
      });
  });
  it("they need to be sorted by created_at date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const {articles} = body
        const expectedSortBy = "created_at"
        const expectedOrder = {descending: true, coerce: true}
        expect(articles).toBeSortedBy(expectedSortBy,expectedOrder);
      });
  });
  it("there should not be a body property present on any of the article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const {articles} = body
        const actual = articles[2];
        const expected = {
          article_id: 5,
          title: "UNCOVERED: catspiracy to bring down democracy",
          topic: "cats",
          author: "rogersop",
          created_at: '2020-08-03T13:14:00.000Z',
          votes: '17',
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: '2',
        };
        expect(actual).toMatchObject(expected);
      });
  });
});
describe('GET /api/articles/:article_id/comments', () => {
  it('GET 200: should respond with an array of comments for the given article_id, where each comment should have the following properties: comment_id, votes, created_at, author, body, article_id', () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const {comments} = body
        const actual = comments;
        const expected = [
      {
        comment_id: 15,
        body: "I am 100% sure that we're not completely sure.",
        article_id: 5,
        author: 'butter_bridge',
        votes: 1,
        created_at: '2020-11-24T00:08:00.000Z'
      },
      {
        comment_id: 14,
        body: 'What do you see? I have no idea where this will lead us. This place I speak of, is known as the Black Lodge.',
        article_id: 5,
        author: 'icellusedkars',
        votes: 16,
        created_at: '2020-06-09T05:00:00.000Z'
      }
    ]
        expect(actual).toMatchObject(expected);
      });
  });
  it('the comments should be sorted by their created_at attribute in descending order', () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const {comments} = body
        const actual = comments;
        const expectedSortBy = "created_at"
        const expectedOrder = {descending: true, coerce: true}
        expect(actual).toBeSortedBy(expectedSortBy,expectedOrder);
      })
  });
  it('GET 200: should respond with an empty array when the given article exists but has no comment', () => {
    return request(app)
      .get("/api/articles/8/comments")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const {comments} = body
        
        expect(comments.length).toBe(0)
      })
  });
  it('GET 404: not found if article does not exists', () => {
    return request(app)
      .get("/api/articles/1113/comments")
      .expect(404)
      .then((response) => {
        const { body } = response;
        const {msg} = body
        
        expect(msg).toBe("article not found")
      })
  });
});
