import type { JsonValue } from "@earendil-works/chord";
import { describe, expect, it } from "vitest";
import { assignJson } from "../src/harness/json.ts";

describe("assignJson", () => {
	it("stores prototype-named JSON keys without mutating object prototypes", () => {
		const target: Record<string, JsonValue> = { data: {} };
		const value = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"name":"safe"}}') as JsonValue;
		assignJson(target, "data", value);
		expect(Object.getPrototypeOf(target)).toBe(Object.prototype);
		expect(Object.getPrototypeOf(target.data)).toBe(Object.prototype);
		expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
		expect(Object.keys(target.data as object)).toEqual(["__proto__", "constructor"]);
		expect(Object.getOwnPropertyDescriptor(target.data, "__proto__")?.value).toEqual({ polluted: true });
	});

	it("does not reuse an inherited object when assigning an own JSON key", () => {
		const target: Record<string, JsonValue> = {};
		assignJson(target, "__proto__", { safe: "value" });
		expect(Object.getPrototypeOf(target)).toBe(Object.prototype);
		expect(Object.hasOwn(target, "__proto__")).toBe(true);
		expect(Object.getOwnPropertyDescriptor(target, "__proto__")?.value).toEqual({ safe: "value" });
	});
});
