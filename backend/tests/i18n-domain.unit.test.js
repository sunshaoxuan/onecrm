import test from "node:test";
import assert from "node:assert/strict";
import { isProtectedKey, resolveTranslation } from "../src/domain/i18n/translation.js";
import { normalizeLanguage, parseAcceptLanguage } from "../src/domain/i18n/language.js";

test("normalizeLanguage handles empty and region values", () => {
  assert.equal(normalizeLanguage(null), null);
  assert.equal(normalizeLanguage(""), null);
  assert.equal(normalizeLanguage("  "), null);
  assert.equal(normalizeLanguage("EN-US"), "en");
  assert.equal(normalizeLanguage("zh"), "zh");
});

test("parseAcceptLanguage returns first valid normalized language", () => {
  assert.equal(parseAcceptLanguage(undefined), null);
  assert.equal(parseAcceptLanguage(""), null);
  assert.equal(parseAcceptLanguage("  "), null);
  assert.equal(parseAcceptLanguage("zh-CN,zh;q=0.9,en;q=0.8"), "zh");
  assert.equal(parseAcceptLanguage("  ;q=0.9,en-US;q=0.8"), "en");
});

test("isProtectedKey checks key prefixes", () => {
  assert.equal(isProtectedKey(undefined), false);
  assert.equal(isProtectedKey(""), false);
  assert.equal(isProtectedKey("MSG_WELCOME"), true);
  assert.equal(isProtectedKey("AUTH_LOGIN_TITLE"), false);
  assert.equal(isProtectedKey("APP_TITLE"), true);
});

test("resolveTranslation uses requested language and fallbacks", () => {
  assert.equal(resolveTranslation(null, "zh", "MSG_HELLO"), "MSG_HELLO");
  assert.equal(
    resolveTranslation({ zh: "你好", en: "Hello" }, "zh", "MSG_HELLO"),
    "你好"
  );
  assert.equal(
    resolveTranslation({ en: "Hello", ja: "こんにちは" }, "zh", "MSG_HELLO"),
    "こんにちは"
  );
  assert.equal(
    resolveTranslation({ fr: "Bonjour", de: "Hallo" }, "zh", "MSG_HELLO"),
    "Bonjour"
  );
  assert.equal(resolveTranslation({}, "zh", "MSG_HELLO"), "MSG_HELLO");
});
