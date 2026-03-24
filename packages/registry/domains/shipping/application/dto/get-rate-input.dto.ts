export interface GetRateInput {
  originCountry: string;
  destinationCountry: string;
  weightGrams: number;
  carrierId?: string;
}
