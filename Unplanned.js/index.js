import * as trello from "./trello";

import React from "react";
import ReactDOM from "react-dom";

import Loading from "./Loading";
import Board from "./Board";

class App extends React.Component {
  state = {
    stage: "loading",
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
  componentDidMount() {
    trello
      .prepare()
      .then(() => this.setState({ stage: "ready" }), err => this.error(err));
  }
  render() {
    const { stage, error } = this.state;
    return (
      <React.Fragment>
        {error && <p className="alert alert-danger">{error}</p>}
        {stage == "loading" && <Loading />}
        {stage == "ready" && (
          <Connect
            onConnect={() => this.setState({ stage: "connected" })}
            onError={err => this.error(err)}
          />
        )}
        {stage == "connected" && <Viewer onError={err => this.error(err)} />}
      </React.Fragment>
    );
  }
}

class Viewer extends React.Component {
  state = {
    boards: null,
    boardId: null,
    mode: null
  };
  componentDidMount() {
    this.setState({ boards: "loading" });
    trello
      .getBoards()
      .then(boards => this.setState({ boards }), this.props.onError);
  }
  render() {
    const { boards, boardId, mode } = this.state;
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
          <ModeSelector
            mode={mode}
            onSelect={mode => this.setState({ mode })}
          />
        )}
        {boardId &&
          mode == "epics" && (
            <Board
              key={boardId}
              boardId={boardId}
              onError={this.props.onError}
            />
          )}
        {boardId && mode == "unplanned" && <p>Unplanned</p>}
      </React.Fragment>
    );
  }
}

function ModeSelector({ mode, onSelect }) {
  return (
    <form className="card">
      <div className="card-body">
        <div className="custom-control custom-radio custom-control-inline">
          <input
            id="mode-input-epics"
            name="mode"
            type="radio"
            selected={mode == "epics"}
            onChange={() => onSelect("epics")}
            className="custom-control-input"
          />
          <label htmlFor="mode-input-epics" className="custom-control-label">
            Epics
          </label>
        </div>
        <div className="custom-control custom-radio custom-control-inline">
          <input
            id="mode-input-unplanned"
            name="mode"
            type="radio"
            selected={mode == "unplanned"}
            onChange={() => onSelect("unplanned")}
            className="custom-control-input"
          />
          <label
            htmlFor="mode-input-unplanned"
            className="custom-control-label"
          >
            Unplanned
          </label>
        </div>
      </div>
    </form>
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
