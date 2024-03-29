// Import supertest for HTTP requests
const request = require("supertest");
// note that we take advantage of @jest/globals (describe, it, expect, etc.)
// API for expect can be found here: https://jestjs.io/docs/expect

const app = require("../index");

describe("Endpoint tests", () => {
  beforeEach(async () => {
    // Reset the server state before each test to ensure test isolation
    await request(app).get("/api/v1/reset");
  });
  
  /*---------------------------
   Write your tests below here
  ---------------------------*/


  it("GET /events - should return all events", async () => {
    const response = await request(app).get("/api/v1/books");
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
  

  // it("Post /events - should create a new event", async () => {
  //   const response = (await request(app).post("api/v1/events")).body();
  //   expect(response.statusCode).toBe(200);
  //   // expect(response.body).toMatchObject({
  //   //   id: 4,
  //   //   name : "my new event",
  //   //   date : "2024-05-01",
  //   //   location : "harpa"
  //   // })
  // });

  it("Post /events - should create a new event", async () => {
    // Example genreId and bookId - these should be replaced with actual IDs
    const genreId = 1; // Make sure this genreId exists in your testing environment
    const newBook = {
    title: "New Book Title",
    author: "New Book Author",
  };
    const response = await request(app).post(`/api/v1/genres/${genreId}/books`).send(newBook);
    expect(response.statusCode).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty('title', newBook.title);
    expect(response.body).toHaveProperty('author', newBook.author);
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe('number');
    expect(response.body).toHaveProperty('genreId', genreId);
  });
  
  it("PATCH /api/v1/genres/:genreId/books/:bookId should update a book and return the updated object with a 200 status", async () => {
    const genreId = 1;
    const bookId = 123;
    const updateData = {
      title: "Updated Book Title",
      author: "Updated Author",
    };
    const response = await request(app).patch(`/api/v1/genres/${genreId}/books/${bookId}`).send(updateData);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    // Verify that the response body includes the updates for title and author
    expect(response.body.title).toBe(updateData.title);
    expect(response.body.author).toBe(updateData.author);
    expect(response.body.genreId).toBe(genreId);
  });
  

  // Try to call and endpoint that does not exists
  it("Example Test: should return a 404 status for a non-existent endpoint", async () => {
    const response = await request(app).get("/api/v1/nonExistentEndpoint");
    expect(response.statusCode).toBe(404);
  });
});
