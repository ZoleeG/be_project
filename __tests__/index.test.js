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
        topics.forEach((topic)=>{
            expect(typeof topic.slug).toBe('string')
            expect(typeof topic.description).toBe('string')
        })
      });
  });
  it('GET: 400 should respond with an error when the url is incorrect', () => {
    return request(app)
      .get("/api/twopics")
      .expect(400)
      .then((response) => {
        expect(response.badRequest).toBe(true)
        expect(response._body.msg).toBe('Bad request')
      })
  });
});
