// Lightweight client-side notification and OTP helper service.
// - Uses `localStorage` for demo persistence.
// - If `REACT_APP_EMAIL_API` is set, will POST OTPs / reminders to that endpoint (server required).

interface OtpSession { otp: string; expiresAt: number }
interface Notification { id: string; message: string; type: 'info' | 'success' | 'error' | 'warning'; timestamp: number; persistent: boolean }

const OTP_TTL_MS = 1000 * 60 * 10; // 10 minutes

const storage = {
  get(key: string) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  },
  set(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)); }
};

export const sendOtpEmail = async (email: string) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const session: OtpSession = { otp, expiresAt: Date.now() + OTP_TTL_MS };
  const sessions = storage.get('otpSessions') || {};
  sessions[email] = session;
  storage.set('otpSessions', sessions);

  const api = (window as any).ENV?.EMAIL_API_URL || process.env.REACT_APP_EMAIL_API;
  if (api) {
    try {
      await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: email, subject: 'Your OTP code', body: `Your code: ${otp}` }) });
      return otp;
    } catch (e) {
      // fallback to demo
    }
  }

  try { await navigator.clipboard.writeText(otp); } catch {}
  // For demo when no backend configured, show an alert so developer/tester can see code
  alert(`[DEMO] OTP for ${email}: ${otp} (copied to clipboard)`);
  return otp;
};

export const verifyOtp = (email: string, code: string) => {
  const sessions = storage.get('otpSessions') || {};
  const session: OtpSession | null = sessions[email] || null;
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    delete sessions[email]; storage.set('otpSessions', sessions); return false;
  }
  const ok = session.otp === code;
  if (ok) { delete sessions[email]; storage.set('otpSessions', sessions); }
  return ok;
};

export const saveUser = (user: { name: string; email: string; password: string }) => {
  const users = storage.get('users') || [];
  // replace if exists by email
  const filtered = users.filter((u: any) => u.email !== user.email);
  filtered.push(user);
  storage.set('users', filtered);
};

export const findUserByEmail = (email: string) => {
  const users = storage.get('users') || [];
  return users.find((u: any) => u.email === email) || null;
};

export const findUserByName = (name: string) => {
  const users = storage.get('users') || [];
  return users.find((u: any) => u.name && u.name.toLowerCase() === name.toLowerCase()) || null;
};

// Booking reminder helpers
export const scheduleFlightReminder = async (booking: any) => {
  const reminders = storage.get('flightReminders') || [];
  // compute remindAt 24h before departure if possible
  const departure = new Date(booking.flightDeparture).getTime();
  const remindAt = isNaN(departure) ? Date.now() : Math.max(0, departure - 24 * 60 * 60 * 1000);
  const entry = { ...booking, remindAt, notified: false };
  reminders.push(entry);
  storage.set('flightReminders', reminders);

  // If departure is within 48 hours, send an immediate demo reminder.
  if (remindAt <= Date.now() + (1000 * 60 * 5)) {
    // immediate demo send
    const userEmail = booking.userEmail;
    const subject = `Reminder: Flight ${booking.flightId} in ~24 hours`;
    const body = `Hi ${booking.userName},\n\nThis is a reminder that your flight (${booking.flightId}) departs on ${booking.flightDeparture}.`;
    await sendReminderEmail(userEmail, subject, body);
  }
};

export const sendReminderEmail = async (to: string, subject: string, body: string) => {
  const api = (window as any).ENV?.EMAIL_API_URL || process.env.REACT_APP_EMAIL_API;
  if (api) {
    try {
      await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, body }) });
      return true;
    } catch (e) { /* continue to demo */ }
  }
  alert(`[DEMO EMAIL] To: ${to}\nSubject: ${subject}\n\n${body}`);
  return true;
};

export const getDueReminders = (hoursAhead = 48) => {
  const reminders = storage.get('flightReminders') || [];
  const now = Date.now();
  const windowEnd = now + hoursAhead * 60 * 60 * 1000;
  return reminders.filter((r: any) => !r.notified && (r.remindAt || now) <= windowEnd);
};

export const markReminded = (ids: string[]) => {
  const reminders = storage.get('flightReminders') || [];
  const updated = reminders.map((r: any) => ids.includes(r.id) ? { ...r, notified: true } : r);
  storage.set('flightReminders', updated);
};

// Run once on import to process any reminders that are due (demo behaviour)
(function runDueReminders() {
  try {
    const reminders = storage.get('flightReminders') || [];
    const now = Date.now();
    reminders.forEach(async (r: any) => {
      const departure = new Date(r.flightDeparture).getTime();
      const remindAt = departure - 24 * 60 * 60 * 1000;
      if (remindAt <= now) {
        await sendReminderEmail(r.userEmail, `Reminder: Flight ${r.flightId}`, `Hi ${r.userName}, your flight departs on ${r.flightDeparture}.`);
      }
    });
  } catch (e) {}
})();

// Persistent notification management
export const addNotification = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', persistent: boolean = false) => {
  const notifications = storage.get('notifications') || [];
  const notification: Notification = { id: Date.now().toString(), message, type, timestamp: Date.now(), persistent };
  notifications.push(notification);
  storage.set('notifications', notifications);
  return notification;
};

export const getNotifications = () => {
  return storage.get('notifications') || [];
};

// Note: Notifications cannot be cleared - they persist for compliance
export const getPersistentNotifications = () => {
  const notifications = storage.get('notifications') || [];
  return notifications.filter((n: Notification) => n.persistent);
};

export const getFlightRemindersWithCountdown = () => {
  const reminders = storage.get('flightReminders') || [];
  const now = Date.now();
  
  return reminders.map((r: any) => {
    const departure = new Date(r.flightDeparture).getTime();
    const diffMs = Math.max(0, departure - now);
    const hoursUntilDeparture = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secondsUntil = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return {
      ...r,
      hoursUntilDeparture,
      minutesUntil,
      secondsUntil,
      totalSecondsUntil: Math.floor(diffMs / 1000),
      isDepartureSoon: hoursUntilDeparture <= 24 && hoursUntilDeparture > 0
    };
  }).filter((r: any) => r.totalSecondsUntil > 0);
};

export default {
  sendOtpEmail,
  verifyOtp,
  saveUser,
  findUserByEmail,
  findUserByName,
  scheduleFlightReminder,
  sendReminderEmail,
  getDueReminders,
  markReminded,
  addNotification,
  getNotifications,
  getPersistentNotifications,
  getFlightRemindersWithCountdown
};
