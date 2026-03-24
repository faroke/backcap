export interface AddAddressInput {
  userId: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
}
