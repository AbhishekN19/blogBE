import { describe, it, expect } from "vitest";
import { registerSchema, postSchema, commentSchema } from "./schemas";

//______________FOR REGISTER SCHEMA______________________//
describe("registerSchema", () => {
  it("should pass with valid data", () => {
    const result = registerSchema.safeParse({
      username: "abhishek",
      password: "securepass1234",
      role: "admin",
    });
    expect(result.success).toBe(true);
  });
  it("should fail id username is less than 3 characters", () => {
    const result = registerSchema.safeParse({
      username: "ab",
      password: "securepassword12342",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Username must be at least 3 characters",
    );
  });
  it("should fail if password is too short", () => {
    const result = registerSchema.safeParse({
      username: "abhishek N",
      password: "smol",
    });
    expect(result.success).toBe(false);
  });
  it("should fail with invalid role", () => {
    const result = registerSchema.safeParse({
      username: "abhishek N",
      password: "1290239034934",
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });
  it("should default role to viewer if no role is provided", () => {
    const result = registerSchema.safeParse({
      username: "meltingfool",
      password: "123454659034-2",
    });
    expect(result.success).toBe(true);
    expect(result.data.role).toBe("viewer");
  });
});

//______________FOR POST SCHEMA__________________//

describe("postSchema", () => {
  it("Should pass with valid title and content", () => {
    const result = postSchema.safeParse({
      title: "My first post",
      content: "Hello dear world",
    });
    expect(result.success).toBe(true);
  });
  it("should fail with empty title", () => {
    const result = postSchema.safeParse({
      title: "",
      content: "Hello world",
    });
    expect(result.success).toBe(false);
  });
  it("should fail with empty content", () => {
    const result = postSchema.safeParse({
      title: "Title goes here",
    });
    expect(result.success).toBe(false);
  });
});

//______________FOR POST-COMMENT SCHEMA__________________//

describe("commentSchema", () => {
  it("should pass with valid content", () => {
    const result = commentSchema.safeParse({
      content: "this is a valid comment",
    });
    expect(result.success).toBe(true);
  });
  it("should fail with empty content", () => {
    const result = commentSchema.safeParse({
      content: "",
    });
    expect(result.success).toBe(false);
  });
  it("should fail when characters are over 500", () => {
    const result = commentSchema.safeParse({
      content: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
