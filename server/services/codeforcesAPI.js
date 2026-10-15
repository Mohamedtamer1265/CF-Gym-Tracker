import axios from "axios";
import crypto from "node:crypto";

const API_BASE_URL = "https://codeforces.com/api";

const getApiUrl = (method, params, credentials) => {
  const requestParams = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  );

  if (credentials) {
    requestParams.set("apiKey", credentials.apiKey);
    requestParams.set("time", Math.floor(Date.now() / 1000).toString());

    const sortedParams = [...requestParams.entries()].sort(
      ([keyA, valueA], [keyB, valueB]) =>
        keyA.localeCompare(keyB) || valueA.localeCompare(valueB)
    );
    const canonicalQuery = new URLSearchParams(sortedParams).toString();
    const randomPrefix = crypto.randomBytes(3).toString("hex");
    const hash = crypto
      .createHash("sha512")
      .update(`${randomPrefix}/${method}?${canonicalQuery}#${credentials.apiSecret}`)
      .digest("hex");

    requestParams.set("apiSig", `${randomPrefix}${hash}`);
  }

  return `${API_BASE_URL}/${method}?${requestParams.toString()}`;
};

const request = async (method, params, credentials) => {
  const { data } = await axios.get(getApiUrl(method, params, credentials));
  if (data.status !== "OK") {
    throw new Error(data.comment || `Codeforces API request failed: ${method}`);
  }
  return data.result;
};

export const fetchUserSubmissions = async (handle, credentials) =>
  request("user.status", { handle }, credentials);

export const fetchGyms = async (credentials) =>
  request(
    "contest.list",
    credentials ? { gym: true, groupCode: credentials.groupCode } : { gym: true },
    credentials
  );

export const fetchGymById = async (contestId, credentials) => {
  const result = await request(
    "contest.standings",
    { contestId, from: 1, count: 1 },
    credentials
  );
  return result.contest;
};