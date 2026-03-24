import { Result } from "../shared/result.js";
import type { IActivityStore } from "../application/ports/activity-store.port.js";
import { RecordActivity } from "../application/use-cases/record-activity.use-case.js";
import { GetFeed } from "../application/use-cases/get-feed.use-case.js";
import { GetTimeline } from "../application/use-cases/get-timeline.use-case.js";
import type { IActivityService } from "./activity.contract.js";

export type ActivityServiceDeps = {
  activityStore: IActivityStore;
};

export function createActivityService(
  deps: ActivityServiceDeps,
): IActivityService {
  const recordActivity = new RecordActivity(deps.activityStore);
  const getFeed = new GetFeed(deps.activityStore);
  const getTimeline = new GetTimeline(deps.activityStore);

  return {
    record: async (input) => {
      const result = await recordActivity.execute(input);
      if (result.isFail()) {
        return Result.fail(result.unwrapError());
      }
      const { output } = result.unwrap();
      return Result.ok(output);
    },
    getFeed: (input) => getFeed.execute(input),
    getTimeline: (input) => getTimeline.execute(input),
  };
}
