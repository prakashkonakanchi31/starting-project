import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  parseAuthMode,
  validateAuthForm,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from "@/app/lib/auth-validation";

describe("parseAuthMode", () => {
  it("returns signup only on exact match", () => {
    expect(parseAuthMode("signup")).toBe("signup");
  });

  it.each([undefined, "", "foo", ["signup", "x"]])(
    "defaults to signin for %j",
    (value) => {
      expect(parseAuthMode(value)).toBe("signin");
    },
  );
});

describe("isValidEmail", () => {
  it.each(["a@b.com", "user.name@example.co"])("accepts %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(["", "no-at-sign", "missing-domain@", "@missing-local.com"])(
    "rejects %s",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});

describe("validateAuthForm", () => {
  it("rejects a password shorter than the minimum", () => {
    const { valid, errors } = validateAuthForm({
      mode: "signin",
      email: "a@b.com",
      password: "a".repeat(MIN_PASSWORD_LENGTH - 1),
    });
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });

  it("rejects a password longer than the maximum", () => {
    const { valid, errors } = validateAuthForm({
      mode: "signin",
      email: "a@b.com",
      password: "a".repeat(MAX_PASSWORD_LENGTH + 1),
    });
    expect(valid).toBe(false);
    expect(errors.password).toBeDefined();
  });

  it("requires a name on signup but not signin", () => {
    const signup = validateAuthForm({
      mode: "signup",
      email: "a@b.com",
      password: "password123",
    });
    expect(signup.valid).toBe(false);
    expect(signup.errors.name).toBeDefined();

    const signin = validateAuthForm({
      mode: "signin",
      email: "a@b.com",
      password: "password123",
    });
    expect(signin.valid).toBe(true);
  });

  it("accepts a valid signup payload", () => {
    const { valid, errors } = validateAuthForm({
      mode: "signup",
      email: "a@b.com",
      password: "password123",
      name: "Ada",
    });
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });
});
