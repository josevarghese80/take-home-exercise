import React from 'react';
import ReactDOM from 'react-dom/client';
// import './amplify-config';
import App from './App';
// import { trackEvent, getOrCreateUserId } from './utils/analytics';
// import { record } from '@aws-amplify/analytics';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
//Record an event
// Analytics.record('some-event-name');
// trackEvent('page_visit', {
//   userId,
//   firstVisit: visits === 1 ? 'yes' : 'no',
//   visitCount: visits.toString(),
//   path: window.location.pathname,
// });