const app = require("../app");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const endpoints = require("../endpoints.json");
const { default_article_img_url } = require("../models");

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
  it("GET 200: an article response object should also now include comment_count, which is the total count of all the comments with this article_id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const expected = {
          comment_count: "11",
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
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article not found");
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

        expect(length).toBe(10);

        articles.forEach((article) => {
          expect(Object.keys(article).length).toBe(9);
          expect(Object.keys(article)).toEqual([
            "author",
            "title",
            "article_id",
            "topic",
            "created_at",
            "article_img_url",
            "comment_count",
            "votes",
            "total_count",
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
          expect(typeof votes).toContain("string");
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
        expect(length).toBe(10);

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
          author: "icellusedkars",
          title: "Sony Vaio; or, The Laptop",
          article_id: 2,
          topic: "mitch",
          created_at: "2020-10-16T05:03:00.000Z",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: "0",
          votes: "0",
          total_count: "3",
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
          expect(Object.keys(comment)).toEqual([
            "comment_id",
            "body",
            "article_id",
            "author",
            "votes",
            "created_at",
          ]);
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
  it("GET 400: bad request if request is of incorrect datatype", () => {
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
describe("POST /api/articles/:article_id/comments", () => {
  it("POST 201: adds comment to an article and responds with the posted comment", () => {
    const inputBody = {
      username: "lurker",
      body: "Excellent work from the author",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(inputBody)
      .expect(201)
      .then(({ body }) => {
        const { newComment } = body;
        const [actual] = newComment;
        const expected = {
          body: "Excellent work from the author",
          article_id: 2,
          author: "lurker",
          comment_id: 19,
          votes: 0,
        };
        expect(actual).toMatchObject(expected);
        const bodyKey = actual.body;
        const { comment_id, article_id, author, votes, created_at } = actual;

        expect(typeof bodyKey).toBe("string");
        expect(typeof article_id).toBe("number");
        expect(typeof author).toBe("string");
        expect(typeof votes).toBe("number");
        expect(typeof created_at).toBe("string");
        expect(typeof comment_id).toBe("number");
      });
  });
  it("POST 404: if username does not exists", () => {
    const inputBody = {
      username: "fgf",
      body: "Excellent work",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(inputBody)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid input");
      });
  });
  it("POST 400: if article_id is invalid", () => {
    const inputBody = {
      username: "lurker",
      body: "Excellent work",
    };
    return request(app)
      .post("/api/articles/lurker/comments")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
  it("POST 404: if article_id is non-existent", () => {
    const inputBody = {
      username: "lurker",
      body: "Excellent work",
    };
    return request(app)
      .post("/api/articles/9999/comments")
      .send(inputBody)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid input");
      });
  });
  it("POST 400: if missing field(s) in the input body (e.g. if it does not have one of the keys required)", () => {
    const inputBody = {
      body: "Excellent work",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  it("PATCH 200: should update the selected article in accordance with the input body, where { inc_votes : 1 } would increment the current article's vote property by 1", () => {
    const inputBody = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/2")
      .send(inputBody)
      .expect(200)
      .then(({ body }) => {
        const { updatedArticle } = body;
        const [actual] = updatedArticle;
        const expected = {
          article_id: 2,
          title: "Sony Vaio; or, The Laptop",
          votes: 1,
        };
        expect(actual).toMatchObject(expected);
      });
  });
  it("PATCH 200: { inc_votes : -1 } would decrement the current article's vote property by 1", () => {
    const inputBody = {
      inc_votes: -1,
    };
    return request(app)
      .patch("/api/articles/2")
      .send(inputBody)
      .expect(200)
      .then(({ body }) => {
        const { updatedArticle } = body;
        const [actual] = updatedArticle;
        const expected = {
          article_id: 2,
          title: "Sony Vaio; or, The Laptop",
          votes: -1,
        };
        expect(actual).toMatchObject(expected);
      });
  });
  it("PATCH 400: bad request error is thrown if inc_votes different from -1 or 1", () => {
    const inputBody = {
      inc_votes: "1",
    };
    return request(app)
      .patch("/api/articles/2")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
  it("PATCH 400: invalid id", () => {
    const inputBody = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/hu")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
  it("PATCH 404: valid id but not in the database", () => {
    const inputBody = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/9999")
      .send(inputBody)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article not found");
      });
  });
  it("PATCH 400: invalid key on the input object", () => {
    const inputBody = {
      not_inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/2")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  it("DELETE 204: it should delete the given comment by comment_id and respond with status 204 and no content", () => {
    return request(app)
      .delete("/api/comments/11")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  it("DELETE 404: if path does not exist", () => {
    return request(app)
      .delete("/api/comments/19")
      .expect(404)
      .then(({ body }) => {
        const expected = "Not found";
        expect(body.msg).toEqual(expected);
      });
  });
  it("DELETE 400: invalid path", () => {
    return request(app)
      .delete("/api/comments/hu")
      .expect(400)
      .then(({ body }) => {
        const expected = "Bad request";
        expect(body.msg).toEqual(expected);
      });
  });
});
describe("GET /api/users", () => {
  it("GET 200: should respond with an array of objects, each object should have the following properties: username, name, avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { users } = body;
        const length = users.length;
        const { userData } = data;
        expect(length).toBe(4);
        expect(users).toMatchObject(userData);
      });
  });
});
describe("GET /api/users?username=", () => {
  it("GET 200: should accept a username query and return the corresponding user object which should have the following properties: username, avatar_url, name", () => {
    return request(app)
      .get("/api/users?username=icellusedkars")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { users } = body;
        const length = users.length;
        const { userData } = data;
        const expected = userData.filter((user) => {
          return user.username === "icellusedkars";
        });
        expect(length).toBe(1);
        expect(users).toMatchObject(expected);
      });
  });
  it("GET 200: should return an empty array if no such username", () => {
    return request(app)
      .get("/api/users?username=icelloo")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { users } = body;
        expect(users).toMatchObject([]);
      });
  });
  it("GET 200: should return all the users if queryKey is incorrect", () => {
    return request(app)
      .get("/api/users?nem=icel")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { users } = body;
        const length = users.length;
        const { userData } = data;
        expect(length).toBe(4);
        expect(users).toMatchObject(userData);
      });
  });
});
describe("GET /api/articles?topic=", () => {
  it("GET 200: should accept a topic query, and respond with a filtered set of articles according to it", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const length = articles.length;
        expect(length).toBe(10);

        articles.forEach((article) => {
          expect(Object.keys(article)).toEqual([
            "author",
            "title",
            "article_id",
            "topic",
            "created_at",
            "article_img_url",
            "comment_count",
            "votes",
            "total_count",
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
  it("GET 200: returns an empty array if topic has no associated articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
  it("GET 200: even if topic does not exist it will return an empty array", () => {
    return request(app)
      .get("/api/articles?topic=55")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
  it("GET 200: returns all the articles even if query key is incorrect", () => {
    return request(app)
      .get("/api/articles?tok=mitch")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const length = articles.length;

        expect(length).toBe(10);

        articles.forEach((article) => {
          expect(Object.keys(article).length).toBe(9);
          expect(Object.keys(article)).toEqual([
            "author",
            "title",
            "article_id",
            "topic",
            "created_at",
            "article_img_url",
            "comment_count",
            "votes",
            "total_count",
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
});
describe("GET /api/articles [sort_by, order]", () => {
  it("GET 200: it should now accept these queries: sort_by, which sorts the articles by any valid column (defaults to the created_at date) and order, which can be set to asc or desc for ascending or descending (defaults to descending)", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=desc")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const length = articles.length;
        expect(length).toBe(10);

        const expectedSortBy = "votes";
        const expectedOrder = { descending: true, coerce: true };
        expect(articles).toBeSortedBy(expectedSortBy, expectedOrder);
      });
  });
  it("GET 200: when all 3 queries are used", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=votes&order=asc")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const length = articles.length;
        expect(length).toBe(10);

        const expectedSortBy = "votes";
        const expectedOrder = { ascending: true, coerce: true };
        expect(articles).toBeSortedBy(expectedSortBy, expectedOrder);
      });
  });
});
describe("PATCH /api/comments/:comment_id", () => {
  it("PATCH 200: should update the selected comment in accordance with the input body, where { inc_votes : 1 } would increment the respective comment's vote property by 1", () => {
    const inputBody = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(inputBody)
      .expect(200)
      .then(({ body }) => {
        const { updatedComment } = body;
        const [actual] = updatedComment;
        const expected = {
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
        };
        expect(actual).toMatchObject(expected);
      });
  });
  it("PATCH 200: should update the selected comment in accordance with the input body, where { inc_votes : -1 } would decrement the respective comment's vote property by 1", () => {
    const inputBody = {
      inc_votes: -1,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(inputBody)
      .expect(200)
      .then(({ body }) => {
        const { updatedComment } = body;
        const [actual] = updatedComment;
        const expected = {
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 15,
          author: "butter_bridge",
          article_id: 9,
        };
        expect(actual).toMatchObject(expected);
      });
  });
  it("PATCH 400: bad request error is thrown if inc_votes different from -1 or 1", () => {
    const inputBody = {
      inc_votes: "1",
    };
    return request(app)
      .patch("/api/comments/1")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
  it("PATCH 400: invalid id", () => {
    const inputBody = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/hu")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
  it("PATCH 404: valid id but not in the database", () => {
    const inputBody = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/9999")
      .send(inputBody)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Comment not found");
      });
  });
  it("PATCH 400: invalid key on the input object", () => {
    const inputBody = {
      not_inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
});
describe("POST /api/articles", () => {
  it("POST 201: creates a new article with the input keys: author, title, body, topic and article_img_url. Then returns it as response with the additional keys of article_id, created_at, votes and comment_count", () => {
    const inputBody = {
      author: "rogersop",
      title: "How to write a cover letter",
      body: `Writing a cover letter involves crafting a concise, engaging document that complements your resume and highlights your suitability for the job you're applying for. Here's a step-by-step guide`,
      topic: "mitch",
      article_img_url:
        "https://images.pexels.com/photos/48195/document-agreement-documents-sign-48195.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(inputBody)
      .expect(201)
      .then(({ body }) => {
        const { newArticle } = body;
        const actual = newArticle;
        const expected = {
          author: "rogersop",
          title: "How to write a cover letter",
          body: `Writing a cover letter involves crafting a concise, engaging document that complements your resume and highlights your suitability for the job you're applying for. Here's a step-by-step guide`,
          topic: "mitch",
          article_img_url:
            "https://images.pexels.com/photos/48195/document-agreement-documents-sign-48195.jpeg?w=700&h=700",
        };
        expect(actual).toMatchObject(expected);
        const bodyKey = actual.body;
        const {
          author,
          title,
          topic,
          article_img_url,
          article_id,
          votes,
          created_at,
          comment_count,
        } = actual;
        expect(typeof article_id).toBe("number");
        expect(typeof title).toBe("string");
        expect(typeof topic).toBe("string");
        expect(typeof author).toBe("string");
        expect(typeof bodyKey).toBe("string");
        expect(typeof created_at).toBe("string");
        expect(typeof article_img_url).toBe("string");
        expect(typeof comment_count).toBe("string");
        expect(typeof votes).toBe("number");
      });
  });
  it("POST 201: article_img_url should default if not provided", () => {
    const inputBody = {
      author: "rogersop",
      title: "How to write a cover letter",
      body: `Writing a cover letter involves crafting a concise, engaging document that complements your resume and highlights your suitability for the job you're applying for. Here's a step-by-step guide`,
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(inputBody)
      .expect(201)
      .then(({ body }) => {
        const { newArticle } = body;
        const actual = newArticle;
        const expected = {
          author: "rogersop",
          title: "How to write a cover letter",
          body: `Writing a cover letter involves crafting a concise, engaging document that complements your resume and highlights your suitability for the job you're applying for. Here's a step-by-step guide`,
          topic: "mitch",
          article_img_url: default_article_img_url,
        };
        expect(actual).toMatchObject(expected);
        const bodyKey = actual.body;
        const {
          author,
          title,
          topic,
          article_img_url,
          article_id,
          votes,
          created_at,
          comment_count,
        } = actual;
        expect(typeof article_id).toBe("number");
        expect(typeof title).toBe("string");
        expect(typeof topic).toBe("string");
        expect(typeof author).toBe("string");
        expect(typeof bodyKey).toBe("string");
        expect(typeof created_at).toBe("string");
        expect(typeof article_img_url).toBe("string");
        expect(typeof comment_count).toBe("string");
        expect(typeof votes).toBe("number");
      });
  });
  it("POST 404: if author does not exist", () => {
    const inputBody = {
      author: "idontexist",
      title: "How to write a cover letter",
      body: `Writing a cover letter involves crafting a concise, engaging document that complements your resume and highlights your suitability for the job you're applying for. Here's a step-by-step guide`,
      topic: "mitch",
      article_img_url:
        "https://images.pexels.com/photos/48195/document-agreement-documents-sign-48195.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(inputBody)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid input");
      });
  });
  it("POST 404: if topic does not exist", () => {
    const inputBody = {
      author: "rogersop",
      title: "How to write a cover letter",
      body: `Writing a cover letter involves crafting a concise, engaging document that complements your resume and highlights your suitability for the job you're applying for. Here's a step-by-step guide`,
      topic: "itdoesntexist",
      article_img_url:
        "https://images.pexels.com/photos/48195/document-agreement-documents-sign-48195.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(inputBody)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid input");
      });
  });
  it("POST 400: missing field(s) in the input body, eg. if topic is missing", () => {
    const inputBody = {
      author: "rogersop",
      title: "How to write a cover letter",
      body: `Writing a cover letter involves crafting a concise, engaging document that complements your resume and highlights your suitability for the job you're applying for. Here's a step-by-step guide`,
      article_img_url:
        "https://images.pexels.com/photos/48195/document-agreement-documents-sign-48195.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
});
describe("GET /api/articles [limit, p]", () => {
  it("GET 200: -PAGINATION- it should now accept these queries: limit, which limits the number of responses (defaults to 10), and p, stands for page and specifies the page at which to start (calculated using limit)", () => {
    return request(app)
      .get("/api/articles?limit=2&p=1")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const length = articles.length;
        expect(length).toBe(2);
      });
  });
  it("GET 200: if limit is not provided it will default to 10", () => {
    return request(app)
      .get("/api/articles?p=1")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const length = articles.length;
        expect(length).toBe(10);
      });
  });
  it("GET 200: if limit is 3 and we want to see the 5th page", () => {
    return request(app)
      .get("/api/articles?limit=3&p=5")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const expected = {
          author: "icellusedkars",
          title: "Z",
          article_id: 7,
          topic: "mitch",
          created_at: "2020-01-07T14:08:00.000Z",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: "0",
          votes: "0",
        };
        const length = articles.length;
        expect(length).toBe(1);
        expect(articles[0]).toMatchObject(expected);
      });
  });
  it("GET 200: the response should also include the total_count property, displaying the total number of articles (this should display the total number of articles with any filters applied, discounting the limit) ", () => {
    return request(app)
      .get("/api/articles?limit=2&p=4")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const expected = {
          author: "butter_bridge",
          title: "They're not exactly dogs, are they?",
          article_id: 9,
          topic: "mitch",
          created_at: "2020-06-06T09:10:00.000Z",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: "2",
          votes: "36",
          total_count: "5",
        };
        const length = articles.length;
        expect(length).toBe(2);
        expect(articles[1]).toEqual(expected);
      });
  });
  it("GET 200: displays the correct total_count if a filter is applied, discounting the limit", () => {
    return request(app)
      .get("/api/articles?limit=2&p=4&topic=mitch")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        const expected = {
          author: "rogersop",
          title: "Seven inspirational thought leaders from Manchester UK",
          article_id: 10,
          topic: "mitch",
          created_at: "2020-05-14T04:15:00.000Z",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: "0",
          votes: "0",
          total_count: "4",
        };
        const length = articles.length;
        expect(length).toBe(2);
        expect(articles[1]).toEqual(expected);
      });
  });
  it("GET 200: returns an empty array if limit has no associated articles", () => {
    return request(app)
      .get("/api/articles?limit=15&p=4&topic=mitch")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
});
describe("GET /api/articles/:article_id/comments [limit, p]", () => {
  it("GET 200: -PAGINATION- it should now accept these queries: limit, which limits the number of responses (defaults to 10), and p, stands for page and specifies the page at which to start (calculated using limit)", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=20")
      .expect(200)
      .then((response) => {
        const { body } = response;
        const { comments } = body;
        const length = comments.length;

        expect(length).toBe(11);

        comments.forEach((comment) => {
          expect(Object.keys(comment).length).toBe(6);
          expect(Object.keys(comment)).toEqual([
            "comment_id",
            "body",
            "article_id",
            "author",
            "votes",
            "created_at",
          ]);
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
});
describe("POST /api/topics", () => {
  it("POST 201: it should add a new topic with the input keys: slug and description, and return the newly added topic object", () => {
    const inputBody = {
      slug: "euro 2024",
      description: "Discussion about the UEFA EURO 2024 tournament.",
    };
    return request(app)
      .post("/api/topics")
      .send(inputBody)
      .expect(201)
      .then(({ body }) => {
        const { newTopic } = body;
        const actual = newTopic;
        const expected = {
          slug: "euro 2024",
          description: "Discussion about the UEFA EURO 2024 tournament.",
        };
        expect(actual).toMatchObject(expected);
        const { slug, description } = actual;
        expect(typeof slug).toBe("string");
        expect(typeof description).toBe("string");
      });
  });
  it("POST 400: missing field(s) in the input body, eg. if slug is missing", () => {
    const inputBody = {
      description: "Discussion about the UEFA EURO 2024 tournament.",
    };
    return request(app)
      .post("/api/topics")
      .send(inputBody)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
  });
});
describe("DELETE /api/articles/:article_id", () => {
  it("DELETE 204: it should delete the given article by article_id and respond with status 204 and no content", () => {
    return request(app)
      .delete("/api/articles/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  it("DELETE 404: if path does not exist", () => {
    return request(app)
      .delete("/api/articles/19")
      .expect(404)
      .then(({ body }) => {
        const expected = "Not found";
        expect(body.msg).toEqual(expected);
      });
  });
  it("DELETE 400: invalid path", () => {
    return request(app)
      .delete("/api/articles/hu")
      .expect(400)
      .then(({ body }) => {
        const expected = "Bad request";
        expect(body.msg).toEqual(expected);
      });
  });
});
