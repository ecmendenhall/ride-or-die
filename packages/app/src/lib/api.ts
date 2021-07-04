declare const window : any;

const login = async (address : string) => {
  let response = await fetch("/login", {
    method: "POST",
    body: JSON.stringify({
      address: address,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let { nonce } = await response.json();
  return nonce;
};

const sign = async (address : string, signature : string) => {
  let response = await fetch("/login/sign", {
    method: "POST",
    body: JSON.stringify({
      address: address,
      signature: signature,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let { token } = await response.json();
  window.localStorage.setItem('ride-or-die-token', token);
};

const linkStrava = async () => {
  let response = await fetch("/link-strava");
  let { location } = await response.json();
  window.location = location;
}

const stravaProfile = async () => {
  let response = await fetch("/profile");
  console.log(response);
  let { athlete, stats } = await response.json();
  let { profile: imageURL } = athlete;
  let { distance: recentRides } = stats.recent_ride_totals;
  let { distance: thisYear } = stats.ytd_ride_totals;
  let { distance: allTime } = stats.all_ride_totals;
  return { imageURL, recentRides, thisYear, allTime };
};

const exports = {
  login: login,
  sign: sign,
  linkStrava: linkStrava,
  stravaProfile: stravaProfile
};

export default exports;
