export interface GetAggregatedRatingInput {
  resourceId: string;
  resourceType: string;
}

export interface GetAggregatedRatingOutput {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
