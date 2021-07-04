import React from "react";
import { Provider } from "./Context";
import { Strava } from "./components/strava";
import { Container } from "./components/container";
import { Panel } from "./components/panel";
import { Title } from "./components/title";
import { Goal } from "./components/goal";
import { Login } from "./components/login";

function Welcome() {
  return (
    <div className="grid grid-cols-3 gap-6 items-center justify-items-center">
      <Strava />
      <Goal />
    </div>
  );
}

function App() {
  return (
    <Provider>
      <Container>
        <Login />
        <Title />
        <Panel>
          <Welcome />
        </Panel>
      </Container>
    </Provider>
  );
}

export default App;
