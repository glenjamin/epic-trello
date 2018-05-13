import $ from "jquery/src/core";
import "jquery/src/ajax/xhr";
import "jquery/src/attributes";
import "jquery/src/manipulation";
window.jQuery = $;

import scriptjs from "scriptjs";
const apiKey = window.globalSettings.trelloApiKey;
const trelloScriptUrl = `https://api.trello.com/1/client.js?key=${apiKey}`;
scriptjs(trelloScriptUrl, () => {
  init();
});

function displayError(message) {
  alert(message);
}

function activateSection(section) {
  $(".js-app .js-section").addClass("d-none");
  return $(".js-app .js-" + section).removeClass("d-none");
}

function init() {
  const $auth = activateSection("auth");
  $auth.find(".js-btn").on("click", () => {
    Trello.authorize({
      type: "popup",
      name: "Testing Application",
      scope: {
        read: "true"
      },
      expiration: "never",
      success: selectBoard,
      error: () => displayError("Failed to authorize")
    });
  });
}

function selectBoard() {
  const $board = activateSection("pick-board");
  const $select = $board.find(".js-select");
  const $loading = $board.find(".js-loading");

  Trello.members.get("me/boards", {}, gotBoards, boardsFailed);

  function boardsFailed() {
    displayError("Failed to get boards");
  }

  function gotBoards(boards) {
    boards.forEach(board => {
      $select.append(`<option value="${board.id}">${board.name}</option>`);
    });
    $loading.addClass("d-none");
    $select.removeClass("d-none");
    $select.on("change", () => {
      showEpics($select.val());
    });
  }
}

function showEpics(boardId) {
  const $epics = activateSection("epics");

  const $loading = $epics.find(".js-loading");
  const $epicTemplate = $epics
    .find(".js-epic-template")
    .clone()
    .removeClass("d-none js-epic-template");
  const $epicList = $epics.find(".js-epic-list").empty();
  const $update = $epics.find(".js-update");

  $update.off("click").on("click", () => showEpics(boardId));

  Trello.boards.get(
    `${boardId}/cards`,
    { attachments: true },
    gotCards,
    cardsFailed
  );

  function cardsFailed() {
    displayError("Failed to get cards");
  }

  function gotCards(cards) {
    cards.forEach(card => {
      const $epic = $epicTemplate.clone();
      $epic
        .find(".js-epic-name")
        .html(`<a href="${card.url}">${card.name}</a>`);
      $epic.appendTo($epicList);
      expandEpic($epic, card);
    });
    $loading.addClass("d-none");
    $update.removeClass("d-none");
  }
}

function expandEpic($epic, card) {
  const $loading = $epic.find(".js-cards-loading");
  const $cardTemplate = $epic
    .find(".js-card-template")
    .removeClass("js-card-template");

  const cardsP = card.attachments
    .map(attachmentToCardId)
    .filter(Boolean)
    .map(
      cardId =>
        new Promise((resolve, reject) => {
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
        })
    );

  Promise.all(cardsP).then(gotTasks, tasksFailed);

  function tasksFailed() {
    displayError(`Failed to get tasks for ${card.name}`);
  }

  function gotTasks(cards) {
    cards.sort(cardSort);

    cards.forEach(card => {
      const $card = $cardTemplate.clone().removeClass("d-none");
      $card
        .find(".js-card-name")
        .html(`<a href="${card.url}">${card.name}</a>`);
      $card.find(".js-card-list").text(`${card.list.name}`);
      $card.appendTo($cardTemplate.parent());
    });
    $loading.addClass("d-none");
  }

  function cardSort(a, b) {
    if (a.list.id === b.list.id) {
      return a.pos - b.pos;
    }
    return b.list.pos - a.list.pos;
  }

  function attachmentToCardId(at) {
    const m = /^https:\/\/trello\.com\/c\/([^/]+)/.exec(at.url);
    return m && m[1];
  }
}
