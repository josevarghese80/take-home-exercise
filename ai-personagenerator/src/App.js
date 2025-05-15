// import './amplify-config';
// import { Amplify } from 'aws-amplify';
import React, { useState,useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CompanyForm from './components/CompanyForm';
import PersonaCard from './components/PersonaCard';

// import { trackEvent, getOrCreateUserId } from './utils/analytics';


const App = () => {
  const [personas, setPersonas] = useState([]);
  const startTime = useRef(Date.now());
  const visitCountKey = 'visit_count';

  useEffect(() => {
    (async () => {
      const userId = ""
      const visits = parseInt(localStorage.getItem(visitCountKey) || '0') + 1;
      localStorage.setItem(visitCountKey, visits);

      // trackEvent('page_visit', {
      //   userId,
      //   firstVisit: visits === 1 ? 'yes' : 'no',
      //   visitCount: visits.toString(),
      //   path: window.location.pathname,
      // });
    })();

    return () => {
      const timeSpent = (Date.now() - startTime.current) / 1000;
      // trackEvent('time_on_page', { path: window.location.pathname }, { duration: timeSpent });
    };
  }, []);
  return (
    <div className="container mt-5">
      <h1 className="mb-4">AI Persona Generator</h1>
      <CompanyForm onPersonasGenerated={setPersonas} />
      {personas.length > 0 && (
        <div className="mt-4">
          <h2>Step 2: Generated Personas</h2>
          {personas.map((p, index) => <PersonaCard key={index} persona={p} />)}
        </div>
      )}
    </div>
  );
};

export default App;
