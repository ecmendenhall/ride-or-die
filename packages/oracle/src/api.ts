import fetch from "node-fetch";

const getProgress = async (
  address: string,
  created: string,
  expires: string
) => {
  let response = await fetch(
    `http://localhost:3000/progress/${address}/?after=${created}&before=${expires}`
  );
  let { totalDistance } = await response.json();
  return totalDistance;
};

const api = {
  getProgress: getProgress,
};

export default api;
