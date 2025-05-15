import React from 'react';

const PersonaCard = ({ persona }) => (
  <div className="card mb-3">
    <div className="card-body">
      <h5 className="card-title">{persona.name}</h5>
      <p><strong>Age:</strong> {persona.age}</p>
      <p><strong>Gender:</strong> {persona.gender}</p>
      <p><strong>Location:</strong> {persona.location}</p>
      <p><strong>Job Title:</strong> {persona.jobTitle}</p>
      <p><strong>Interests:</strong> {persona.interests.join(', ')}</p>
      <p><strong>Challenges:</strong> {persona.challenges.join(', ')}</p>
    </div>
  </div>
);

export default PersonaCard;
