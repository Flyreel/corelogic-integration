import { hello } from "../Functions/Hello";
import { Request, Response } from "express";

export const makeHelloHandler = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    if (request.body && request.body.name) {
      const message = hello(request.body.name);
      response.status(200).send(message);
    } else {
      response.status(400).send();
    }
  } catch (err) {
    response.status(500);
    response.send(err);
  }
};
