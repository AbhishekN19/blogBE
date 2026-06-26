import { describe, it, expect, vi } from "vitest";
import validate from "./validate";
import { postSchema } from "../validators/schemas";

describe("validate middleware", () => {
  const mockReq = (body) => ({ body });
  const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockRejectedValue(res);
    return res;
  };
  const mockNext = vi.fn();

  it("should call next(), with valid data", () => {
    const req = mockReq({
      title: "How to talk to cats",
      content: "I don't know",
    });
    const res = mockRes();
    const next = vi.fn();

    validate(postSchema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("should return 400 with invalid data", () => {
    const req = mockReq({ title: "" });
    const res = mockRes();
    const next = vi.fn();

    validate(postSchema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should replace req.body with validated data", () => {
    const req = mockReq({ title: "Test Post", content: "Test Content" });
    const res = mockRes();
    const next = vi.fn();

    validate(postSchema)(req, res, next);

    expect(req.body).toEqual({
      title: "Test Post",
      content: "Test Content",
    });
  });

  it("should return field and message in error details", () => {
    const req = mockReq({ title: "", content: "some message" });
    const res = mockRes();
    const next = vi.fn();

    validate(postSchema)(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Validation Failed",
        details: expect.arrayContaining([
          expect.objectContaining({ field: "title" }),
        ]),
      }),
    );
  });
});
