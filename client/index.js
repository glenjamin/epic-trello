import * as trello from "./trello";

import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {
  state = {
    connected: false,
    error: null
  };
  error(err) {
    // eslint-disable-next-line no-console
    console.error(err);
    this.setState({ error: String(err) });
  }
  componentDidCatch(err) {
    this.error(err);
  }
  render() {
    const { connected, error } = this.state;
    return (
      <React.Fragment>
        {error && <p className="alert alert-danger">{error}</p>}
        {!connected && (
          <Connect
            onConnect={() => this.setState({ connected: true })}
            onError={err => this.error(err)}
          />
        )}
        {connected && <Viewer onError={err => this.error(err)} />}
      </React.Fragment>
    );
  }
}

class Viewer extends React.Component {
  state = {
    boards: null,
    boardId: null
  };
  componentDidMount() {
    this.setState({ boards: "loading" });
    trello
      .getBoards()
      .then(boards => this.setState({ boards }), this.props.onError);
  }
  render() {
    const { boards, boardId } = this.state;
    return (
      <React.Fragment>
        {boards === "loading" && <Loading />}
        {Array.isArray(boards) && (
          <BoardSelector
            boards={boards}
            onSelect={boardId => this.setState({ boardId })}
          />
        )}
        {boardId && (
          <Board key={boardId} boardId={boardId} onError={this.props.onError} />
        )}
      </React.Fragment>
    );
  }
}

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

function BoardSelector({ boards, onSelect }) {
  return (
    <select
      onChange={e => onSelect(e.target.value)}
      className="custom-select custom-select-lg"
    >
      <option value="">Select Board...</option>
      {boards.map(board => (
        <option key={board.id} value={board.id}>
          {board.name}
        </option>
      ))}
    </select>
  );
}

function Loading() {
  return <p className="lead">Loading...</p>;
}

function Connect({ onConnect, onError }) {
  return (
    <button
      onClick={() => trello.authorize().then(onConnect, onError)}
      className="btn btn-success btn-lg"
    >
      Connect To Trello
    </button>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));

if (module.hot) {
  module.hot.accept();
}
