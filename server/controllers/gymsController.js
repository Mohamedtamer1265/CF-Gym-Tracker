import { fetchGyms, fetchUserSubmissions } from "../services/codeforcesAPI.js";
import { getGyms as getCachedGyms } from "../services/cacheGyms.js";

const getCredentials = (req) => {
  const groupCode = req.get("x-cf-group-code")?.trim();
  const apiKey = req.get("x-cf-api-key")?.trim();
  const apiSecret = req.get("x-cf-api-secret")?.trim();
  const provided = [groupCode, apiKey, apiSecret].filter(Boolean).length;

  if (provided === 0) return null;
  if (provided !== 3) {
    const error = new Error(
      "Group code, Codeforces API key, and API secret are all required."
    );
    error.statusCode = 400;
    throw error;
  }

  return { groupCode, apiKey, apiSecret };
};

const getGymsForRequest = async (req) => {
  const credentials = getCredentials(req);
  if (credentials) {
    return {
      credentials,
      gyms: await fetchGyms(credentials),
    };
  }

  return { credentials: null, gyms: Object.values(getCachedGyms()) };
};

export const getGyms = async (req, res) => {
  try {
    const { gyms } = await getGymsForRequest(req);
    const { difficulty } = req.query;
    let result = gyms;
    if (difficulty) {
      const minDiff = Number(difficulty);
      if (isNaN(minDiff)) {
        return res.status(400).json({ error: "Invalid difficulty value" });
      }
      result = result.filter((gym) => Number(gym.difficulty) === minDiff);
    }
    result = result.map((gym) => ({
      ...gym,
      contestLink: `https://codeforces.com/gym/${gym.id}`,
    }));
    res.json(result);
  } catch (error) {
    console.error("Error in getGyms:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
const solo = "practice";
export const getUserVirtualGyms = async (req, res) => {
  /// max usersubmissions maybe 8k
  try {
    let { handles, difficulty } = req.query;
    const { credentials, gyms } = await getGymsForRequest(req);
    const gymsById = new Map(gyms.map((gym) => [String(gym.id), gym]));

    if (!handles) {
      return res.status(400).json({ error: "Missing handles" });
    }
    if (!Array.isArray(handles)) {
      handles = [handles];
    }
    const submissions = await fetchUserSubmissions(handles[0], credentials);
    const userGyms = {};
    const solvedKeys = new Set();
    for (const sub of submissions) {
      if (sub.contestId < 100000 || sub.verdict !== "OK") continue;
      const contest = gymsById.get(String(sub.contestId));
      if (!contest || contest.phase != "FINISHED") continue;
      if (Number(difficulty) != 0)
        if (Number(contest.difficulty) !== Number(difficulty)) continue;
      const queryHandles = new Set(handles);

      const memberHandles = new Set(
        (sub.author?.members || []).map((m) => m.handle)
      );

      const allMembersMatch = [...queryHandles].every((h) =>
        memberHandles.has(h)
      );
      if (!allMembersMatch) continue;

      const teamId = sub.author?.teamId ?? solo;
      const teamName = sub.author?.teamName || solo;
      if (!userGyms[sub.contestId]) {
        userGyms[sub.contestId] = {
          contestId: sub.contestId,
          contestName: contest.name,
          teamName: teamName,
          contestLink: `https://codeforces.com/gym/${sub.contestId}`,
          difficulty: contest.difficulty ?? difficulty,
          teams: {},
        };
      } else {
        // teamName prefer
        if (
          userGyms[sub.contestId].teamName == solo &&
          teamName != solo
        ) {
          userGyms[sub.contestId].teamName = teamName;
        }
      }

      if (!userGyms[sub.contestId].teams[teamId]) {
        userGyms[sub.contestId].teams[teamId] = { teamName, problems: [] };
      }

      const key = `${sub.contestId}-${teamId}-${sub.problem.index}`;
      if (!solvedKeys.has(key)) {
        solvedKeys.add(key);
        userGyms[sub.contestId].teams[teamId].problems.push({
          problem: `${sub.problem.index} - ${sub.problem.name}`,
          verdict: sub.verdict,
          link: `https://codeforces.com/gym/${sub.contestId}/problem/${sub.problem.index}`,
        });
      }
    }

    res.json(userGyms);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const unsolvedGyms = () => {
  return async (req, res) => {
    try {
      let { handles, difficulty } = req.query;
      const { credentials, gyms } = await getGymsForRequest(req);

      if (!handles) {
        return res
          .status(400)
          .json({ error: "Please provide handles and difficulty" });
      }

      let handlesArray = Array.isArray(handles) ? handles : [handles];

      const userGymSolvedMap = {};

      for (const handle of handlesArray) {
        const submissions = await fetchUserSubmissions(handle, credentials);

        for (const sub of submissions) {
          if (sub.contestId < 100000 || sub.verdict !== "OK") continue;
          userGymSolvedMap[sub.contestId] = 1; // mark this gym as solved
        }
      }

      const result = [];
      for (const gym of gyms) {
        if (gym.phase != "FINISHED") continue;
        if (Number(difficulty) != 0)
          if (gym.difficulty !== Number(difficulty)) continue;

        if (!userGymSolvedMap[gym.id]) {
          result.push({
            id: gym.id,
            contestName: gym.name || `Gym ${gym.id}`,
            contestLink: `https://codeforces.com/gym/${gym.id}`,
            difficulty: gym.difficulty,
          });
        }
      }

      res.json(result);
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  };
};
