import axios from "axios";

export const fetchUserSubmissions = async (handle) => {
  const url = `https://codeforces.com/api/user.status?handle=${handle}`;
  const { data } = await axios.get(url);
  return data.result;
};

export const fetchGyms = async () => {
  const url = "https://codeforces.com/api/contest.list?gym=true";
  const contestsRes = await axios.get(url);
  return contestsRes.data.result;
};
export const fetchGymById = async (contestId) => {
  const url = `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`;
  const { data } = await axios.get(url);
  return data.result.contest; // has contest name & metadata
};