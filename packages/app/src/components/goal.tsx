import React from 'react';

export function Goal() {
    return (
        <div className="max-w-4xl grid grid-cols-1 gap-2">
            <div>
                <label className="text-pink-600 font-semibold">Distance</label>
                <div className="relative flex w-full flex-wrap items-stretch mb-3">
                    <input type="text" placeholder="100"
                           className="px-3 py-3 placeholder-black relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pr-10"/>
                    <span
                        className="z-10 h-full leading-snug font-normal absolute text-center absolute bg-transparent rounded text-sm items-center justify-center w-8 right-0 pr-3 py-3">
                                        km
                                    </span>
                </div>
            </div>
            <div>
                <label className="text-pink-600 font-semibold">Stake</label>
                <div className="relative flex w-full flex-wrap items-stretch mb-3">
                    <input type="text" placeholder="500"
                           className="px-3 py-3 placeholder-black relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full pr-10"/>
                    <span
                        className="z-10 h-full leading-snug font-normal absolute text-center absolute bg-transparent rounded text-sm items-center justify-center w-8 right-0 pr-3 py-3">
                                        DAI
                                    </span>
                </div>
            </div>
            <div>
                <label className="text-pink-600 font-semibold">Deadline</label>
                <div className="relative flex w-full flex-wrap items-stretch mb-3">
                    <input type="date" placeholder="mm/dd/yyy"
                           className="px-3 py-3 placeholder-black relative bg-white bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"/>
                </div>
            </div>
            <button
                className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50">Create
                Goal
            </button>
        </div>
    )
}

