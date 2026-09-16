"use strict";
const markup = require("./markup-v1");
const DEFAULT_LESSON = markup.id;
const lessons = new Map([[markup.id, markup]]);
function getLesson(id = DEFAULT_LESSON) {
  const lesson = lessons.get(id);
  if (!lesson) {
    const error = new Error("That lesson version is not available.");
    error.status = 400;
    throw error;
  }
  return lesson;
}
function lessonFor(game) {
  return getLesson(game.lessonId || DEFAULT_LESSON);
}
function rulesFor(game) {
  return game.rules || lessonFor(game).rules;
}
function initializeLesson(game, id = DEFAULT_LESSON) {
  game.lessonId = id;
  game.rules = structuredClone(getLesson(id).rules);
  return game;
}
function publishedLessons() {
  return [...lessons.values()].map(({ id, label }) => ({ id, label }));
}
function draftFor(game, body) {
  return Object.fromEntries(
    lessonFor(game).draftFields.map((key) => [
      key,
      String(body[key] ?? "").slice(0, 20),
    ]),
  );
}
module.exports = {
  draftFor,
  DEFAULT_LESSON,
  getLesson,
  lessonFor,
  rulesFor,
  initializeLesson,
  publishedLessons,
};
