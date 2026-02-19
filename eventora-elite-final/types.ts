
export type FlightClass = 'Economy' | 'Business' | 'First';
export type BookingStatus = 'Confirmed' | 'Cancelled' | 'Waitlisted' | 'Pending';
export type PaymentMethod = 'GooglePay' | 'UPI' | 'Card' | 'Wallet';
export type FoodType = 'Veg' | 'Non-Veg' | 'Drink' | 'Snack';

// Added UserRole for Header component
export type UserRole = 'FREELANCER' | 'RECRUITER' | 'ADMIN';

export type CateringCategory = 'Food' | 'Drink' | 'Snack';

export interface CateringItem {
  id: string;
  category: CateringCategory;
  foodType?: FoodType;
  label: string;
  desc: string;
  icon: string;
  premium: boolean;
  stock: number;
}

export interface SelectedCatering {
  itemId: string;
  quantity: number;
}

export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string; // ISO Date String
  departureDay: string;
  duration: string;
  basePrice: number;
  stops: number;
  class: FlightClass;
  totalSeats: number;
  passengersBooked: number;
  discountPercent?: number;
  discountLabel?: string;
  isSoldOut?: boolean;
}

// Added Education for FreelancerProfile
export interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  year: string;
}

// Added FreelancerProfile for FreelancerView and AIChat
export interface FreelancerProfile {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  about: string;
  education: Education[];
  skills: string[];
  viewsCount: number;
}

// Added Job for FreelancerView and RecruiterView
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  requirements: string;
  techStack: string[];
  postedDate: string;
  recruiterId: string;
}

// Added Application for FreelancerView and RecruiterView
export interface Application {
  id: string;
  jobId: string;
  freelancerId: string;
  status: 'PENDING' | 'REVIEWED' | 'SELECTED' | 'REJECTED';
  appliedDate: string;
  aiScore?: number;
  aiSummary?: string;
}

export interface PassengerCounts {
  young: number;
  adult: number;
  elder: number;
}

export interface Feedback {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Booking {
  id: string;
  flightId: string;
  userId: string;
  userName: string;
  seats: string[];
  passengers: PassengerCounts;
  selectedCatering: SelectedCatering[]; 
  subtotal: number;
  discount: number;
  ageOffer: number;
  taxes: number;
  totalPrice: number;
  currency: 'USD' | 'INR';
  status: BookingStatus;
  bookingDate: string;
  flightDeparture: string;
  qrCode: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  gate?: string;
  ticketUrl?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  walletBalance: number;
  loyaltyPoints: number;
  preferredLanguage: string;
  role?: UserRole; // optional, defaults to FREELANCER for normal users
}

export interface Notification {
  id: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
  title: string;
  message: string;
  date: string;
  isRead?: boolean;
  // optional timestamp used for flight departure countdown notifications
  departureTimestamp?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  groundingLinks?: { title: string; uri: string }[];
}

// Added EventCategory for EventSearch
export type EventCategory = 'Music' | 'Sports' | 'Tech' | 'Theatre';

// Added Event for BookingModal and EventCard
export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  venue: string;
  city: string;
  date: string;
  image: string;
  rating: number;
  basePrice: number;
  availableSeats: number;
  isPopular?: boolean;
}
