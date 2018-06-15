import load from "little-loader";

import $ from "jquery/src/core";
import "jquery/src/ajax/xhr";
window.jQuery = $;

const apiKey = window.globalSettings.trelloApiKey;
const trelloScriptUrl = `https://api.trello.com/1/client.js?key=${apiKey}`;
const authorizeOptions = {
  type: "popup",
  name: "Epic Trello",
  scope: {
    read: "true"
  },
  expiration: "never"
};

let Trello;
export function prepare() {
  if (Trello) return Promise.resolve();
  return new Promise((resolve, reject) => {
    load(trelloScriptUrl, err => {
      if (err) return reject(err);

      Trello = window.Trello;
      return resolve();
    });
  });
}

export function authorize() {
  return new Promise((resolve, reject) => {
    Trello.authorize(
      Object.assign(
        {
          success: resolve,
          error: reject
        },
        authorizeOptions
      )
    );
  });
}

export function getBoards() {
  return new Promise((resolve, reject) =>
    Trello.members.get("me/boards", {}, resolve, reject)
  );
}

export function getCards(boardId) {
  return new Promise((resolve, reject) =>
    Trello.boards.get(
      `${boardId}/cards`,
      { attachments: true },
      resolve,
      reject
    )
  );
}

export function getSubcards(card) {
  return Promise.all(
    unique(card.attachments.map(attachmentToCardId).filter(Boolean)).map(
      getSubcard
    )
  ).then(cards => cards.sort(cardSort));
}

export function getSubcard(cardId) {
  return new Promise((resolve, reject) => {
    Trello.cards.get(
      cardId,
      {
        fields: ["url", "name", "pos", "closed"],
        list: true,
        list_fields: ["name", "pos"]
      },
      resolve,
      reject
    );
  });
}

function unique(arr) {
  return arr.filter((el, i, a) => i === a.indexOf(el));
}

function attachmentToCardId(at) {
  const m = /^https:\/\/trello\.com\/c\/([^/]+)/.exec(at.url);
  return m && m[1];
}

function cardSort(a, b) {
  if (a.list.id === b.list.id) {
    return a.pos - b.pos;
  }
  return b.list.pos - a.list.pos;
}
