import { faker } from "@faker-js/faker";
import app from "app";
import prisma from "config/database";
import httpStatus from "http-status";
import supertest from "supertest";
import { createConsole } from "./factories/consoles-factory";
import { cleanDb } from "./helpers";

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("POST /consoles", () => {
  it("should create a new console", async () => {
    const newConsole = {
      name: faker.commerce.productName(),
    };

    const postResult = await server.post("/consoles").send(newConsole);
    const result = await prisma.console.findFirst();

    expect(postResult.status).toBe(201);
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        ...newConsole,
      })
    );
  });

  it("should return 409 when trying to create a console that already exists", async () => {
    const newConsole = await createConsole();
    const body = { name: newConsole.name };

    const postResult = await server.post("/consoles").send(body);

    expect(postResult.status).toBe(409);
  });

  it("should return 422 when trying to create a console with invalid body", async () => {
    const body = {
      invalid: "Xstation One 5",
    };

    const postResult = await server.post("/consoles").send(body);
    expect(postResult.status).toBe(422);
    const postResult2 = await server.post("/consoles");
    expect(postResult2.status).toBe(422);
  });
});

describe("GET /consoles", () => {
  it("should return an empty array if doenst have consoles", async () => {
    const result = await server.get("/consoles");

    expect(result.status).toBe(200);
    expect(result.body).toEqual([]);
  });

  it("should return all consoles", async () => {
    const console1 = await createConsole();
    const console2 = await createConsole();

    const result = await server.get("/consoles");

    expect(result.status).toBe(200);
    expect(result.body).toEqual(expect.arrayContaining([
      console1,
      console2
    ]));
  });
});

describe("GET /consoles/:id", () => {
	it("should return a specific console", async () => {
    const newConsole = await createConsole();

		const result = await server.get(`/consoles/${newConsole.id}`);

		expect(result.status).toBe(200);
		expect(result.body).toEqual(
      newConsole
    );
	});

	it("should return 404 when console is not found", async () => {
		const result = await server.get("/consoles/3");

		expect(result.status).toBe(404);
	});
});