const app = require("../app");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const request = require("supertest");

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

describe("GET /api", () => {
  it("GET: 200 should respond with an object describing all the available endpoints on our API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const expected = ["GET /api", "GET /api/topics", "GET /api/articles"];
        const { body } = response;
        const actual = Object.keys(body);
        expect(actual).toMatchObject(expected);
      });
  });
});

describe('Error: invalid_path', () => {
    it("GET: 404 should respond with an error when the url is incorrect", () => {
        return request(app)
          .get("/api/twopics")
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Invalid path");
          });
      });
});
