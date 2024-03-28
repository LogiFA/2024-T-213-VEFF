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
    const response = await request(app).get("api/v1/events");
    // TODO check that response body is there and is an array
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(3);
  })

  it("Post /events - should create a new event", async () => {
    const response = (await request(app).post("api/v1/events")).body();
    expect(response.statusCode).toBe(200);
    // expect(response.body).toHaveProperty('id', 4)
    // expect(response.body).toHaveProperty('name', "my new event")
    // expect(response.body).toHaveProperty('date', "2024-05-01")
    // expect(response.body).toHaveProperty('location', "harpa")
    // expect(response.body).toMatchObject({
    //   id: 4,
    //   name : "my new event",
    //   date : "2024-05-01",
    //   location : "harpa"
    // })
  });


  // Try to call and endpoint that does not exists
  it("Example Test: should return a 404 status for a non-existent endpoint", async () => {
    const response = await request(app).get("/api/v1/nonExistentEndpoint");
    expect(response.statusCode).toBe(404);
  });
});
