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
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <button className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50">Link Strava</button>
                        </div>
                        <div className="max-w-4xl grid grid-cols-1 gap-2">
                            <div>
                                <label className="text-pink-600 font-semibold">Distance</label>
                                <div className="relative flex w-full flex-wrap items-stretch mb-3">
                                    <input type="text" placeholder="100" className="px-3 py-3 placeholder-black relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pr-10"/>
                                    <span className="z-10 h-full leading-snug font-normal absolute text-center absolute bg-transparent rounded text-sm items-center justify-center w-8 right-0 pr-3 py-3">
                                        km
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-pink-600 font-semibold">Stake</label>
                                <div className="relative flex w-full flex-wrap items-stretch mb-3">
                                    <input type="text" placeholder="500" className="px-3 py-3 placeholder-black relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pr-10"/>
                                    <span className="z-10 h-full leading-snug font-normal absolute text-center absolute bg-transparent rounded text-sm items-center justify-center w-8 right-0 pr-3 py-3">
                                        DAI
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-pink-600 font-semibold">Deadline</label>
                                <div className="relative flex w-full flex-wrap items-stretch mb-3">
                                    <input type="date" placeholder="mm/dd/yyy" className="px-3 py-3 placeholder-black relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"/>
                                </div>
                            </div>
                            <button className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50">Create Goal</button>
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
