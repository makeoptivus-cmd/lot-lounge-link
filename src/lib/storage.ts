// Local storage utilities for form data persistence

export interface LandOwnerData {
  id: string;
  areaName: string;
  address: string;
  age: string;
  contactNumber: string;
  ownerBackground: string;
  photo?: string;
  createdAt: string;
}

export interface LandDetailsData {
  id: string;
  ownerId: string;
  areaName: string;
  fmSketch: string;
  siteSketch: string;
  natureOfLand: string;
  ratePerCent: string;
  ratePerSqFt: string;
  createdAt: string;
}

export interface SiteVisitData {
  id: string;
  ownerId: string;
  distanceKm: string;
  visitDate: string;
  notes: string;
  createdAt: string;
}

export interface OwnerMeetingData {
  id: string;
  ownerId: string;
  landRate: string;
  negotiationDetails: string;
  finalPrice: string;
  meetingDate: string;
  createdAt: string;
}

export interface MediationData {
  id: string;
  ownerId: string;
  mediatorName: string;
  mediationDate: string;
  mediationDetails: string;
  outcome: string;
  createdAt: string;
}

export interface BuyerSellerMeetingData {
  id: string;
  ownerId: string;
  buyerName: string;
  buyerContact: string;
  meetingDate: string;
  meetingNotes: string;
  createdAt: string;
}

export interface MeetingPlaceData {
  id: string;
  ownerId: string;
  placeName: string;
  placeAddress: string;
  meetingDate: string;
  meetingTime: string;
  createdAt: string;
}

export interface AdvanceRegistrationData {
  id: string;
  ownerId: string;
  advanceAmount: string;
  advanceDate: string;
  registrationDate: string;
  buyerName: string;
  notes: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  landOwners: 'success_re_land_owners',
  landDetails: 'success_re_land_details',
  siteVisits: 'success_re_site_visits',
  ownerMeetings: 'success_re_owner_meetings',
  mediations: 'success_re_mediations',
  buyerSellerMeetings: 'success_re_buyer_seller_meetings',
  meetingPlaces: 'success_re_meeting_places',
  advanceRegistrations: 'success_re_advance_registrations',
};

function getItems<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function addItem<T>(key: string, item: T): void {
  const items = getItems<T>(key);
  items.push(item);
  setItems(key, items);
}

function deleteItem<T extends { id: string }>(key: string, id: string): void {
  const items = getItems<T>(key);
  setItems(key, items.filter(item => item.id !== id));
}

export const storage = {
  getLandOwners: () => getItems<LandOwnerData>(STORAGE_KEYS.landOwners),
  addLandOwner: (item: LandOwnerData) => addItem(STORAGE_KEYS.landOwners, item),
  deleteLandOwner: (id: string) => deleteItem<LandOwnerData>(STORAGE_KEYS.landOwners, id),

  getLandDetails: () => getItems<LandDetailsData>(STORAGE_KEYS.landDetails),
  addLandDetails: (item: LandDetailsData) => addItem(STORAGE_KEYS.landDetails, item),
  deleteLandDetails: (id: string) => deleteItem<LandDetailsData>(STORAGE_KEYS.landDetails, id),

  getSiteVisits: () => getItems<SiteVisitData>(STORAGE_KEYS.siteVisits),
  addSiteVisit: (item: SiteVisitData) => addItem(STORAGE_KEYS.siteVisits, item),
  deleteSiteVisit: (id: string) => deleteItem<SiteVisitData>(STORAGE_KEYS.siteVisits, id),

  getOwnerMeetings: () => getItems<OwnerMeetingData>(STORAGE_KEYS.ownerMeetings),
  addOwnerMeeting: (item: OwnerMeetingData) => addItem(STORAGE_KEYS.ownerMeetings, item),
  deleteOwnerMeeting: (id: string) => deleteItem<OwnerMeetingData>(STORAGE_KEYS.ownerMeetings, id),

  getMediations: () => getItems<MediationData>(STORAGE_KEYS.mediations),
  addMediation: (item: MediationData) => addItem(STORAGE_KEYS.mediations, item),
  deleteMediation: (id: string) => deleteItem<MediationData>(STORAGE_KEYS.mediations, id),

  getBuyerSellerMeetings: () => getItems<BuyerSellerMeetingData>(STORAGE_KEYS.buyerSellerMeetings),
  addBuyerSellerMeeting: (item: BuyerSellerMeetingData) => addItem(STORAGE_KEYS.buyerSellerMeetings, item),
  deleteBuyerSellerMeeting: (id: string) => deleteItem<BuyerSellerMeetingData>(STORAGE_KEYS.buyerSellerMeetings, id),

  getMeetingPlaces: () => getItems<MeetingPlaceData>(STORAGE_KEYS.meetingPlaces),
  addMeetingPlace: (item: MeetingPlaceData) => addItem(STORAGE_KEYS.meetingPlaces, item),
  deleteMeetingPlace: (id: string) => deleteItem<MeetingPlaceData>(STORAGE_KEYS.meetingPlaces, id),

  getAdvanceRegistrations: () => getItems<AdvanceRegistrationData>(STORAGE_KEYS.advanceRegistrations),
  addAdvanceRegistration: (item: AdvanceRegistrationData) => addItem(STORAGE_KEYS.advanceRegistrations, item),
  deleteAdvanceRegistration: (id: string) => deleteItem<AdvanceRegistrationData>(STORAGE_KEYS.advanceRegistrations, id),
};
