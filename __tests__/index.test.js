const app = require("../app");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const { convertTimestampToDate } = require("../db/seeds/utils");

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
        const expected = {
          "GET /api": {
            description:
              "serves up a json representation of all the available endpoints of the api",
          },
          "GET /api/topics": {
            description: "serves an array of all topics",
            queries: [],
            exampleResponse: {
              topics: [{ slug: "football", description: "Footie!" }],
            },
          },
          "GET /api/articles": {
            description: "serves an array of all articles",
            queries: ["author", "topic", "sort_by", "order"],
            exampleResponse: {
              articles: [
                {
                  title: "Seafood substitutions are increasing",
                  topic: "cooking",
                  author: "weegembump",
                  body: "Text from the article..",
                  created_at: "2018-05-30T15:59:13.341Z",
                  votes: 0,
                  comment_count: 6,
                },
              ],
            },
          },
        };
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
  describe("GET 404: valid input but too high", () => {
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
