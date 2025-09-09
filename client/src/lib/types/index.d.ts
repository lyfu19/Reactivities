type PagedList<T, TCursor> = {
  items: T[];
  nextCursor: TCursor;
};

type Activity = {
  id: string;
  title: string;
  date: Date;
  description: string;
  category: string;
  isCancelled: boolean;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  hostId: string;
  hostDisplayName: string;
  attendees: Profile[];
  isGoing: boolean;
  isHost: boolean;
  hostImageUrl?: string;
};

type ActivityCreate = Omit<
  | Activity
  | "id"
  | "isCancelled"
  | "hostId"
  | "hostDisplayName"
  | "attendees"
  | "isGoing"
  | "isHost"
  | "hostImageUrl"
>;

type Photo = {
  id: string;
  url: string;
};

type Profile = {
  id: string;
  displayName: string;
  bio?: string;
  imageUrl?: string;
  following?: boolean;
  followerCount?: number;
  followingCount?: number;
};

type User = {
  id: string;
  email: string;
  displayName: string;
  imageUrl?: string;
};

type ActivityComment = {
  id: string;
  body: string;
  createdAt: Date;
  userId: string;
  displayName: string;
  imageUrl?: string;
};

type LocationIQSuggestion = {
  place_id: string;
  osm_id: string;
  osm_type: string;
  licence: string;
  lat: string;
  lon: string;
  boundingbox: string[];
  class: string;
  type: string;
  display_name: string;
  display_place: string;
  display_address: string;
  address: LocationIQAddress;
};

type LocationIQAddress = {
  name: string;
  house_number: string;
  road: string;
  suburb: string;
  town?: string;
  village?: string;
  city?: string;
  state: string;
  postcode: string;
  country: string;
  country_code: string;
};
