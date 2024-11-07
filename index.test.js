// install dependencies
const { execSync } = require("child_process");
execSync("npm install");
execSync("npm run seed");

const request = require("supertest");
const { db } = require("./db/connection");
const { Musician } = require("./models/index");
const app = require("./src/app");
const { seedMusician } = require("./seedData");

beforeAll(async () => {
  // Sync the database and seed initial data
  await db.sync({ force: true });
  await Musician.bulkCreate([
    { name: "Mick Jagger", instrument: "Voice" },
    { name: "Jimi Hendrix", instrument: "Guitar" },
  ]);
});

afterAll(async () => {
  // Close the database connection after tests
  await db.close();
});

afterAll(async () => {
  await db.close();
});

describe("/musicians endpoint", () => {
  // Test: Get all musicians
  it("should return a list of musicians", async () => {
    const response = await request(app).get("/musicians");
    const responseData = JSON.parse(response.text);

    expect(response.statusCode).toBe(200);
    expect(responseData).toEqual(
      expect.arrayContaining(
        responseData.map((musician) =>
          expect.objectContaining({
            name: expect.any(String),
            instrument: expect.any(String),
          })
        )
      )
    );
  });

  // Test: Create a new musician
  it("should create a new musician", async () => {
    const newMusician = {
      name: "John Doe",
      instrument: "Drums",
    };

    const response = await request(app).post("/musicians").send(newMusician);
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe(newMusician.name);
    expect(response.body.instrument).toBe(newMusician.instrument);
  });

  // Test: Return an error if musician data is incomplete
  it("should return error if musician data is incomplete", async () => {
    const incompleteMusician = {
      name: "Jane Doe",
      // Missing instrument
    };

    const response = await request(app)
      .post("/musicians")
      .send(incompleteMusician);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "An error occurred while creating the musician"
    );
  });

  // Test: Get a musician by ID
  it("should get a musician by ID", async () => {
    const musician = await Musician.create({
      name: "Lenny Kravitz",
      instrument: "Guitar",
    });

    const response = await request(app).get(`/musicians/${musician.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Lenny Kravitz");
  });

  // Test: Return error if musician is not found
  it("should return error if musician is not found", async () => {
    const response = await request(app).get("/musicians/99999"); // Invalid ID
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Musician not found");
  });
});

describe("/musicians endpoint", () => {
  // Test: Validation for missing "name" field
  it("should return an error when the 'name' field is missing", async () => {
    const incompleteMusician = { instrument: "Drums" };

    const response = await request(app)
      .post("/musicians")
      .send(incompleteMusician);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Name field is required and cannot be empty or whitespace",
        }),
      ])
    );
  });

  // Test: Validation for missing "instrument" field
  it("should return an error when the 'instrument' field is missing", async () => {
    const incompleteMusician = { name: "Jane Doe" };

    const response = await request(app)
      .post("/musicians")
      .send(incompleteMusician);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Instrument field is required and cannot be empty or whitespace",
        }),
      ])
    );
  });

  // Test: Successful creation of a new musician with valid fields
  it("should create a new musician when all fields are valid", async () => {
    const newMusician = { name: "John Doe", instrument: "Guitar" };

    const response = await request(app).post("/musicians").send(newMusician);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "John Doe",
          instrument: "Guitar",
        }),
      ])
    );
  });
});
