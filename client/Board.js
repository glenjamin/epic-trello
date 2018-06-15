import * as trello from "./trello";

import React from "react";

import Loading from "./Loading";

class Board extends React.Component {
  state = {
    cards: null,
    subcards: {}
  };
  componentDidMount() {
    this.setState({ cards: "loading" });
    trello.getCards(this.props.boardId).then(cards => {
      this.setState({ cards, subcards: {} });
      this.expandCards(cards);
    }, this.props.onError);
  }
  expandCards(cards) {
    cards.forEach(card => {
      trello.getSubcards(card).then(
        subcards =>
          this.setState(s => {
            s.subcards[card.id] = subcards;
            return s;
          }),
        this.props.onError
      );
    });
  }
  render() {
    const { cards, subcards } = this.state;
    return (
      <React.Fragment>
        {cards === "loading" && <Loading />}
        {Array.isArray(cards) && (
          <div>
            <p>
              <button
                onClick={() => this.componentDidMount()}
                className="btn btn-outline-primary"
              >
                Refresh
              </button>
            </p>
            {cards.map(card => (
              <Card key={card.id} card={card} subcards={subcards[card.id]} />
            ))}
          </div>
        )}
      </React.Fragment>
    );
  }
}

function Card({ card, subcards }) {
  return (
    <div>
      <h2 className="h3">
        <a href={card.url}>{card.name}</a>
      </h2>
      {!subcards && <Loading />}
      {subcards && !subcards.length && <hr />}
      {subcards &&
        subcards.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Card</th>
                <th>List</th>
              </tr>
            </thead>
            <tbody>
              {subcards.map(subcard => (
                <tr key={subcard.id}>
                  <td>
                    <a href={subcard.url}>{subcard.name}</a>
                  </td>
                  <td>{subcard.list.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}

export default Board;
