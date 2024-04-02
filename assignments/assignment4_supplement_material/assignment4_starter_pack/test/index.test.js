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


  it("GET /books - should return all events", async () => {
    const response = await request(app).get("/api/v1/books");
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
  
  it("GET /api/v1/genres/:genreId/books/:bookId get certain book", async () => {
    const genreId = 1;
    const bookId = 1;
    const response = await request(app).get(`/api/v1/genres/${genreId}/books/${bookId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      title: expect.any(String),
      author: expect.any(String),
      genreId: genreId,
    }));
  });
  //   id: 4,
  //   name : "my new event",
  //   date : "2024-05-01",
  //   location : "harpa"

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
  
  it("PATCH /events - should update a certain event", async () => {
    const genreId = 1;
    const bookId = 2;
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
  
  it("PATCH /events - should fail when an existing book is addressed using an incorrect, but existing genreId", async () => {
    const incorrectGenreId = 2;
    const bookId = 1;
    const updateData = { title: "Attempted Invalid Update" };
    const response = await request(app).patch(`/api/v1/genres/${incorrectGenreId}/books/${bookId}`).send(updateData);
    expect(response.statusCode).toBe(404);
    expect(response.body).toBeDefined();
    expect(response.body.message).toContain(`${bookId} does not exists in genre id ${incorrectGenreId}`);
  });

  it("PATCH /evets - when a request is made with a non-empty request body that does not contain any valid property", async () => {
    const genreId = 1
    const bookId = 3
    const invalidUpdateData = { publicationYear: 2020 };
    const response = await request(app).patch(`/api/v1/genres/${genreId}/books/${bookId}`).send(invalidUpdateData);
    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("To update a book, you need to provide a title, an author, or a new genreId.");
  });

  it("GET /events should fail when the book with the provided id does not exist", async () => {
    const genreId = 1;
    const bookId = 9; 
    const response = await request(app).get(`/api/v1/genres/${genreId}/books/${bookId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBe(`Book with id ${bookId} does not exist`);
  });

  it("POST /events should fail when the request body does not contain the author property", async () => {
    const genreId = 1;
    const bookData = {
      title: "A Book Without an Author",
    };
    const response = await request(app).post(`/api/v1/genres/${genreId}/books/`).send(bookData);
    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();
    expect(response.body.message).toContain("Missing required book fields within the body (title, author).");
  });

  it("POST /api/v1/genres should fail when missing the correct authorization", async () => {
    const newGenre = {
      name: "New Genre",
    };
    const response = await request(app).post(`/api/v1/genres`).send(newGenre);
    expect(response.statusCode).toBe(401);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("Unauthorized");
  });

  it("PATCH /genre - should return 201" , async () => {
    const newGenre = {
      name: "New Genre",
    };

    const HMAC = "d5951928a797e3de418978abeb1c4f036672aa63b3241843493bfae1c0e60923"

    const response = await request(app)
      .post('/api/v1/genres')
      .set('Authorization', `HMAC ${HMAC}`)
      .send(newGenre)
      
    expect(response.statusCode).toBe(201);
    expect(response.body).toBeDefined();
  });

  // Try to call and endpoint that does not exists
  it("Example Test: should return a 404 status for a non-existent endpoint", async () => {
    const response = await request(app).get("/api/v1/nonExistentEndpoint");
    expect(response.statusCode).toBe(404);
  });
});
