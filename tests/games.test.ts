import { faker } from "@faker-js/faker";
import app from "app";
import prisma from "config/database";
import httpStatus from "http-status";
import supertest from "supertest";
import { createConsole } from "./factories/consoles-factory";
import { createGame } from "./factories/games-factory";
import { cleanDb } from "./helpers";

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("POST /games", () => {
  it("should create a new game", async () => {
    const newConsole = await createConsole();
    const newGame = {
      title: faker.commerce.productName(),
      consoleId: newConsole.id,
    };

    const postResult = await server.post("/games").send(newGame);
    const result = await prisma.game.findFirst();

    expect(postResult.status).toBe(201);
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        ...newGame,
      })
    );
  });

  it("should return 409 when trying to create a game that already exists", async () => {
    const newConsole = await createConsole();
    const newGame = await createGame(newConsole.id);
    const body = {
      title: newGame.title,
      consoleId: newConsole.id,
    };

    const postResult = await server.post("/games").send(body);

    expect(postResult.status).toBe(409);
  });

  it("should return 409 when passing a console that doesnt exists", async () => {
    const newConsole = await createConsole();
    const newGame = await createGame(newConsole.id);
    const body = {
      title: newGame.title,
      consoleId: 0,
    };

    const postResult = await server.post("/games").send(body);

    expect(postResult.status).toBe(409);
  });

  it("should return 422 when trying to create a game with invalid body", async () => {
    const body = {
      invalid: "God of Peace",
      consoleIdInvalid: 0,
    };

    const postResult = await server.post("/games").send(body);
    expect(postResult.status).toBe(422);
    const postResult2 = await server.post("/games");
    expect(postResult2.status).toBe(422);
  });
});

describe("GET /games", () => {
  it("should return an empty array if doenst have games", async () => {
    const result = await server.get("/games");

    expect(result.status).toBe(200);
    expect(result.body).toEqual([]);
  });

  it("should return all games", async () => {
    const newConsole = await createConsole();
    const game1 = await createGame(newConsole.id);
    const game2 = await createGame(newConsole.id);

    const result = await server.get("/games");

    expect(result.status).toBe(200);
    expect(result.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Console: newConsole,
          ...game1,
        }),
        expect.objectContaining({
          Console: newConsole,
          ...game2,
        }),
      ])
    );
  });
});

describe("GET /games/:id", () => {
  it("should return a specific game", async () => {
    const newConsole = await createConsole();
    const newGame = await createGame(newConsole.id);

    const result = await server.get(`/games/${newGame.id}`);

    expect(result.status).toBe(200);
    expect(result.body).toEqual(newGame);
  });

  it("should return 404 when game is not found", async () => {
    const result = await server.get("/games/3");

    expect(result.status).toBe(404);
  });
});
