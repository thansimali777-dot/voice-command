import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

function calculateExpression(expression: string): number {
  try {
    // Sanitize and evaluate the expression safely
    // Replace common operators for JS eval
    let cleanExpression = expression
      .replace(/\^/g, "**")
      .replace(/x/g, "*")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/[^0-9+\-*/(). ]/g, "");

    // Validate expression contains only allowed characters
    if (!/^[0-9+\-*/.() ]+$/.test(cleanExpression)) {
      throw new Error("Invalid characters in expression");
    }

    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + cleanExpression + ")")();

    if (!isFinite(result)) {
      throw new Error("Result is not a finite number");
    }

    return parseFloat(parseFloat(result.toString()).toFixed(10));
  } catch (error) {
    throw new Error("Invalid mathematical expression");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Prefix all routes with /api

  app.post("/api/calculate", (req: Request, res: Response) => {
    const { expression } = req.body;

    if (typeof expression !== "string") {
      return res.status(400).json({ error: "Expression must be a string" });
    }

    try {
      const result = calculateExpression(expression);
      return res.json({ result });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || "Calculation error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
