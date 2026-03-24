export class AggregatedRating {
  readonly average: number;
  readonly count: number;
  readonly distribution: Record<1 | 2 | 3 | 4 | 5, number>;

  private constructor(
    average: number,
    count: number,
    distribution: Record<1 | 2 | 3 | 4 | 5, number>,
  ) {
    this.average = average;
    this.count = count;
    this.distribution = { ...distribution };
  }

  static compute(
    distribution: Record<1 | 2 | 3 | 4 | 5, number>,
  ): AggregatedRating {
    const safe = { ...distribution };
    const count = Object.values(safe).reduce((sum, n) => sum + Math.max(0, n), 0);
    if (count === 0) {
      return new AggregatedRating(0, 0, safe);
    }
    const total = (Object.entries(safe) as [string, number][]).reduce(
      (sum, [star, n]) => sum + Number(star) * Math.max(0, n),
      0,
    );
    const average = Math.round((total / count) * 100) / 100;
    return new AggregatedRating(average, count, safe);
  }
}
