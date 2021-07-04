import React, { useContext, useEffect } from "react";

import { Context } from "../Context";
import api from "../lib/api";

export function Strava() {
  const { stravaProfile, setStravaProfile } = useContext(Context);

  useEffect(() => {
    /*const loadProfile = async () => {
      let profile = await api.stravaProfile();
      console.log(profile);
      if (profile && setStravaProfile) {
        setStravaProfile(profile);
      }
    };
    loadProfile();*/
  }, [stravaProfile, setStravaProfile]);

  const onClick = () => {
    api.linkStrava();
  };

  const formatDistance = (meters: number) => {
    return Math.round(meters / 1000);
  };

  return (
    <div>
      {!stravaProfile && (
        <button
          onClick={onClick}
          className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50"
        >
          Link Strava
        </button>
      )}
      {stravaProfile && (
        <div className="space-y-0.5">
          <img src={stravaProfile.imageURL} className="rounded-lg shadow" />
          <p>
            <span className="text-pink-600 font-semibold">Recent:</span>{" "}
            {formatDistance(stravaProfile.recentRides)} km
          </p>
          <p>
            <span className="text-pink-600 font-semibold">This year:</span>{" "}
            {formatDistance(stravaProfile.thisYear)} km
          </p>
          <p>
            <span className="text-pink-600 font-semibold">All time:</span>{" "}
            {formatDistance(stravaProfile.allTime)} km
          </p>
        </div>
      )}
    </div>
  );
}
