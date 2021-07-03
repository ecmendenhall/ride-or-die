import React from 'react';
import {LinkStrava} from "./components/strava";
import {Container} from "./components/container";
import {Panel} from "./components/panel";
import {Title} from "./components/title";
import {Goal} from "./components/goal";
import {EthAuthentication} from "./components/ethAuthentication";

function Welcome() {
    return (
        <div className="grid grid-cols-3 gap-6">
            <LinkStrava/>
            <Goal/>
            <div>
                <p>We should put some more UI components and stuff in here.</p>
            </div>
        </div>
    )
}

function App() {
    return (
        <Container>
            <EthAuthentication/>
            <Title/>
            <Panel>
                <Welcome/>
            </Panel>
        </Container>
    );
}

export default App;
