// Local storage utilities for form data persistence
import { MediaRef, MediaValue } from "./mediaTypes";

export interface TextHighlight {
  start: number;
  end: number;
  color: "yellow" | "orange" | "red" | "blue" | "green";
}

export interface FieldHighlights {
  [fieldName: string]: TextHighlight[];
}

export interface LandOwnerData {
  id: string;
  areaName: string;
  address: string;
  age: string;
  contactNumber: string;
  ownerBackground: string;
  photos: MediaValue[];
  videos: MediaValue[];
  highlight?: "orange" | "red" | "";
  fieldHighlights?: FieldHighlights;
  createdAt: string;
}

export interface MediaData extends MediaRef {
  ownerId: string;
}

export interface LandNatureDetail {
  name: string;
  details: string;
}

export interface LandDetailsData {
  id: string;
  ownerId: string;
  areaName: string;
  pattaNo: string;
  subdivisionNo: string;
  pattaPersonNames: string;
  fmSketch: string;
  siteSketch: string;
  natureOfLand: LandNatureDetail[];
  acreOrCent: string;
  ratePerCent: string;
  ratePerSqFt: string;
  photos: MediaValue[];
  videos: MediaValue[];
  documents?: MediaValue[];
  highlight?: "orange" | "red" | "";
  fieldHighlights?: FieldHighlights;
  createdAt: string;
}

export interface SiteVisitData {
  id: string;
  ownerId: string;
  distanceKm: string;
  visitDate: string;
  notes: string;
  photos: MediaValue[];
  videos: MediaValue[];
  documents?: MediaValue[];
  highlight?: "orange" | "red" | "";
  fieldHighlights?: FieldHighlights;
  createdAt: string;
}

export interface OwnerMeetingData {
  id: string;
  ownerId: string;
  landRate: string;
  negotiationDetails: string;
  finalPrice: string;
  meetingDate: string;
  photos: MediaValue[];
  videos: MediaValue[];
  documents?: MediaValue[];
  highlight?: "orange" | "red" | "";
  fieldHighlights?: FieldHighlights;
  createdAt: string;
}

export interface MediationData {
  id: string;
  ownerId: string;
  mediatorName: string;
  mediationDate: string;
  mediationDetails: string;
  outcome: string;
  photos: MediaValue[];
  videos: MediaValue[];
  documents?: MediaValue[];
  highlight?: "orange" | "red" | "";
  fieldHighlights?: FieldHighlights;
  createdAt: string;
}

export interface BuyerSellerMeetingData {
  id: string;
  ownerId: string;
  buyerName: string;
  buyerContact: string;
  buyerAddress: string;
  sellerContact: string;
  meetingDate: string;
  meetingNotes: string;
  photos: MediaValue[];
  videos: MediaValue[];
  documents?: MediaValue[];
  highlight?: "orange" | "red" | "";
  fieldHighlights?: FieldHighlights;
  createdAt: string;
}

export interface MeetingPlaceData {
  id: string;
  ownerId: string;
  placeName: string;
  placeAddress: string;
  meetingDate: string;
  meetingTime: string;
  meetingStartTime: string;
  meetingEndTime: string;
  photos: MediaValue[];
  videos: MediaValue[];
  documents?: MediaValue[];
  highlight?: "orange" | "red" | "";
  fieldHighlights?: FieldHighlights;
  createdAt: string;
}

export interface AdvanceRegistrationData {
  id: string;
  ownerId: string;
  advanceAmount: string;
  registrationAmount: string;
  secondAmount: string;
  finalAmount: string;
  totalAmount: string;
  advanceDate: string;
  registrationDate: string;
  buyerName: string;
  notes: string;
  photos: MediaValue[];
  videos: MediaValue[];
  documents?: MediaValue[];
  highlight?: "orange" | "red" | "";
  fieldHighlights?: FieldHighlights;
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
  media: 'success_re_media',
};

function getItems<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItems<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Files are too large. Please reduce video/photo sizes.');
    }
    throw e;
  }
}

function addItem<T>(key: string, item: T): void {
  try {
    const items = getItems<T>(key);
    items.push(item);
    setItems(key, items);
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Files are too large. Please reduce video/photo sizes.');
    }
    throw e;
  }
}

function deleteItem<T extends { id: string }>(key: string, id: string): void {
  const items = getItems<T>(key);
  setItems(key, items.filter(item => item.id !== id));
}

function updateItem<T extends { id: string }>(key: string, item: T): void {
  const items = getItems<T>(key);
  const index = items.findIndex(existing => existing.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.push(item);
  }
  setItems(key, items);
}

export const storage = {
  getLandOwners: () => getItems<LandOwnerData>(STORAGE_KEYS.landOwners),
  addLandOwner: (item: LandOwnerData) => addItem(STORAGE_KEYS.landOwners, item),
  updateLandOwner: (item: LandOwnerData) => updateItem(STORAGE_KEYS.landOwners, item),
  deleteLandOwner: (id: string) => deleteItem<LandOwnerData>(STORAGE_KEYS.landOwners, id),

  getLandDetails: () => getItems<LandDetailsData>(STORAGE_KEYS.landDetails),
  addLandDetails: (item: LandDetailsData) => addItem(STORAGE_KEYS.landDetails, item),
  updateLandDetails: (item: LandDetailsData) => updateItem(STORAGE_KEYS.landDetails, item),
  deleteLandDetails: (id: string) => deleteItem<LandDetailsData>(STORAGE_KEYS.landDetails, id),

  getSiteVisits: () => getItems<SiteVisitData>(STORAGE_KEYS.siteVisits),
  addSiteVisit: (item: SiteVisitData) => addItem(STORAGE_KEYS.siteVisits, item),
  updateSiteVisit: (item: SiteVisitData) => updateItem(STORAGE_KEYS.siteVisits, item),
  deleteSiteVisit: (id: string) => deleteItem<SiteVisitData>(STORAGE_KEYS.siteVisits, id),

  getOwnerMeetings: () => getItems<OwnerMeetingData>(STORAGE_KEYS.ownerMeetings),
  addOwnerMeeting: (item: OwnerMeetingData) => addItem(STORAGE_KEYS.ownerMeetings, item),
  updateOwnerMeeting: (item: OwnerMeetingData) => updateItem(STORAGE_KEYS.ownerMeetings, item),
  deleteOwnerMeeting: (id: string) => deleteItem<OwnerMeetingData>(STORAGE_KEYS.ownerMeetings, id),

  getMediations: () => getItems<MediationData>(STORAGE_KEYS.mediations),
  addMediation: (item: MediationData) => addItem(STORAGE_KEYS.mediations, item),
  updateMediation: (item: MediationData) => updateItem(STORAGE_KEYS.mediations, item),
  deleteMediation: (id: string) => deleteItem<MediationData>(STORAGE_KEYS.mediations, id),

  getBuyerSellerMeetings: () => getItems<BuyerSellerMeetingData>(STORAGE_KEYS.buyerSellerMeetings),
  addBuyerSellerMeeting: (item: BuyerSellerMeetingData) => addItem(STORAGE_KEYS.buyerSellerMeetings, item),
  updateBuyerSellerMeeting: (item: BuyerSellerMeetingData) => updateItem(STORAGE_KEYS.buyerSellerMeetings, item),
  deleteBuyerSellerMeeting: (id: string) => deleteItem<BuyerSellerMeetingData>(STORAGE_KEYS.buyerSellerMeetings, id),

  getMeetingPlaces: () => getItems<MeetingPlaceData>(STORAGE_KEYS.meetingPlaces),
  addMeetingPlace: (item: MeetingPlaceData) => addItem(STORAGE_KEYS.meetingPlaces, item),
  updateMeetingPlace: (item: MeetingPlaceData) => updateItem(STORAGE_KEYS.meetingPlaces, item),
  deleteMeetingPlace: (id: string) => deleteItem<MeetingPlaceData>(STORAGE_KEYS.meetingPlaces, id),

  getAdvanceRegistrations: () => getItems<AdvanceRegistrationData>(STORAGE_KEYS.advanceRegistrations),
  addAdvanceRegistration: (item: AdvanceRegistrationData) => addItem(STORAGE_KEYS.advanceRegistrations, item),
  updateAdvanceRegistration: (item: AdvanceRegistrationData) => updateItem(STORAGE_KEYS.advanceRegistrations, item),
  deleteAdvanceRegistration: (id: string) => deleteItem<AdvanceRegistrationData>(STORAGE_KEYS.advanceRegistrations, id),

  getMediaByOwnerId: (ownerId: string) => {
    const allMedia = getItems<MediaData>(STORAGE_KEYS.media);
    return allMedia.filter(m => m.ownerId === ownerId);
  },
  addMedia: (item: MediaData) => addItem(STORAGE_KEYS.media, item),
  deleteMedia: (id: string) => deleteItem<MediaData>(STORAGE_KEYS.media, id),
};
