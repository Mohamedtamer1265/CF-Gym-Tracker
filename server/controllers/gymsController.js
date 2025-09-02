import { fetchUserSubmissions } from "../services/codeforcesAPI.js";
import {
  getGyms as getCachedGyms,
  getGymById,
  getMapCachedGyms,
} from "../services/cacheGyms.js";
export const getGyms = async (req, res) => {
  try {
    const gyms = getCachedGyms();
    const { difficulty } = req.query;
    let result = Object.values(gyms);
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
    res.status(500).json({ error: error.message });
  }
};

export const getUserVirtualGyms = async (req, res) => {
  try {
    let { handles, difficulty } = req.query;

    if (!handles) {
      return res.status(400).json({ error: "Missing handles" });
    }
    if (!Array.isArray(handles)) {
      handles = [handles];
    }
    const submissions = await fetchUserSubmissions(handles[0]);
    const userGyms = {};
    const solvedKeys = new Set();
    for (const sub of submissions) {
      if (sub.contestId < 100000 || sub.verdict !== "OK") continue;
      const contest = getGymById(sub.contestId);
      if (!contest && contest.phase != "FINISHED") continue;
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

      const teamId = sub.author?.teamId ?? `__UPSOLVED__`;
      const teamName = sub.author?.teamName || "__UPSOLVED__";

      if (!userGyms[sub.contestId]) {
        userGyms[sub.contestId] = {
          contestId: sub.contestId,
          contestName: contest.name,
          teamName: teamName,
          contestLink: `https://codeforces.com/gym/${sub.contestId}`,
          difficulty: contest.difficulty ?? difficulty,
          teams: {},
        };
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
    res.status(500).json({ error: error.message });
  }
};

export const unsolvedGyms = () => {
  return async (req, res) => {
    try {
      let { handles, difficulty } = req.query;

      if (!handles) {
        return res
          .status(400)
          .json({ error: "Please provide handles and difficulty" });
      }

      let handlesArray = Array.isArray(handles) ? handles : [handles];

      const userGymSolvedMap = {};

      for (const handle of handlesArray) {
        const submissions = await fetchUserSubmissions(handle);

        for (const sub of submissions) {
          if (sub.contestId < 100000 || sub.verdict !== "OK") continue;
          userGymSolvedMap[sub.contestId] = 1; // mark this gym as solved
        }
      }

      const gymsMap = getMapCachedGyms();
      const result = [];
      for (const gym of gymsMap.values()) {
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
      res.status(500).json({ error: err.message });
    }
  };
};
