import { describe, it, expect } from "vitest";
import { Action } from "../value-objects/action.vo.js";
import { InvalidAction } from "../errors/invalid-action.error.js";

describe("Action VO", () => {
  it("creates valid action 'invited' (single word)", () => {
    const result = Action.create("invited");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("invited");
  });

  it("creates valid action 'uploaded-file' (kebab-case)", () => {
    const result = Action.create("uploaded-file");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("uploaded-file");
  });

  it("creates valid action 'added2' (with digit)", () => {
    const result = Action.create("added2");
    expect(result.isOk()).toBe(true);
  });

  it("rejects uppercase 'INVITED'", () => {
    const result = Action.create("INVITED");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAction);
  });

  it("rejects camelCase 'uploadedFile'", () => {
    const result = Action.create("uploadedFile");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAction);
  });

  it("rejects NOUN.VERB format 'USER.INVITED'", () => {
    const result = Action.create("USER.INVITED");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAction);
  });

  it("rejects empty string", () => {
    const result = Action.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAction);
  });

  it("rejects string starting with hyphen", () => {
    const result = Action.create("-invited");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAction);
  });

  it("rejects string with spaces", () => {
    const result = Action.create("uploaded file");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAction);
  });
});
