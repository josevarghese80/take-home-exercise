
// import { record, identifyUser } from '@aws-amplify/analytics';
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();



/**
 * Safely track a Google Analytics event using gtag.js
 *
 * @param {string} action - Event name (e.g., 'form_error', 'cta_click')
 * @param {string} category - Event category (e.g., 'Form', 'User Interaction')
 * @param {string} label - Additional label to describe the event (e.g., 'Submit Button Clicked')
 * @param {number} [value=1] - Numeric value associated with the event
 */
export const trackEvent = (action, category, label, value = 1) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  } else {
    // Dev fallback logging
    if (!isProduction) {
      console.log('[trackEvent]', { action, category, label, value });
    }
  }
};
