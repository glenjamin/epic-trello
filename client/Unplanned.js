import * as trello from "./trello";

import React from "react";

import Loading from "./Loading";

class Unplanned extends React.Component {
  state = {
    cards: null
  };
  componentDidMount() {
    this.setState({ cards: "loading" });
    trello.getUnplannedCards(this.props.boardId).then(cards => {
      this.setState({ cards });
    }, this.props.onError);
  }
  render() {
    const { cards } = this.state;
    return (
      <React.Fragment>
        {cards === "loading" && <Loading />}
        {Array.isArray(cards) && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Last Updated</th>
                <th>Archived</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => <Card key={card.id} card={card} />)}
            </tbody>
          </table>
        )}
      </React.Fragment>
    );
  }
}

function Card({ card }) {
  return (
    <tr>
      <td>
        <a href={card.url}>{card.name}</a>
      </td>
      <td>{card.lastActivity.toString()}</td>
      <td>{card.closed ? "Yes" : "No"}</td>
    </tr>
  );
}

export default Unplanned;
