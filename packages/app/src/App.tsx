import React from 'react';

function App() {
    return (
        <div className="container my-12 mx-6 p-4">
            <button className="fixed top-8 right-10 bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50">Connect Wallet</button>
            <div className="grid grid-cols-6 grid-rows-4 gap-4 p-4">
                <div className="col-start-2 col-span-4 row-span-1">
                    <h1 className="font-script text-7xl text-center text-pink-600">🚴‍♀️ Ride or Die 💀</h1>
                </div>
                <div className="col-start-2 col-span-4 row-span-3 bg-yellow-50 border border-solid border-gray-300 rounded-lg shadow p-6">
                    <div className="text-center space-y-4">
                        <div>
                            <button className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50">Link Strava</button>
                        </div>
                        <div>
                            <p>We should put some more UI components and stuff in here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
