import React, { useState } from 'react';
import { generatePersonas } from '../api';
import { trackEvent } from '../utils/analytics';
const CompanyForm = ({ onPersonasGenerated }) => {
  const [companyName, setCompanyName] = useState('');
  const [companyTraits, setCompanyTraits] = useState('');
  const [errors, setErrors] = useState([]);


  const validate = () => {
    const errs = [];
    if (!companyName.trim()) errs.push('name_required');
    if (!companyTraits.trim()) errs.push('traits_required');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validate();




    if (isValid) {

      try {
        const companyData = {
          name: companyName,
          characteristics: companyTraits
        };
        const personas = await generatePersonas(companyData);
        onPersonasGenerated(personas);
        // trackEvent('form_submit', { success: 'yes' });
        trackEvent('persona_generated', 'success');
        trackEvent('form_submit', 'success');
      } catch (err) {
        trackEvent('server_error', 'fail', err.message);
        trackEvent('persona_generated', 'fail');
      }
    } else {
      trackEvent('form_submit', 'fail');
    }

  };

  const handleClick = (label) => {
    trackEvent('generate_persona_click', 'User Interaction', 'Generate Persona Button');
  };
  return (
    <form className="p-4" onSubmit={handleSubmit}>
      <h2>Step 1: Company Input</h2>
      <div className="mb-3">
        <label className="form-label">Company Name</label>
        <input
          type="text"
          className="form-control"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Company Characteristics</label>
        <textarea
          className="form-control"
          rows="3"
          value={companyTraits}
          onChange={(e) => setCompanyTraits(e.target.value)}
          placeholder="Enter traits, culture, market, etc."
        ></textarea>
      </div>
      <button type="submit" onClick={() => handleClick('submit_form')} className="btn btn-primary">Generate Personas</button>
    </form>
  );
};

export default CompanyForm;
