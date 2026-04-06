import React from 'react';
import PlaceholderPage from '../PlaceholderPage';
import { Stethoscope } from 'lucide-react';

const PhysicianPortal = () => {
  return (
    <PlaceholderPage 
      title="Physician & Laboratory Partnership" 
      icon={<Stethoscope size={48} />}
      description="Advanced clinical tools, EMR integration, and rapid testing turnaround for medical practices and healthcare providers."
    />
  );
};

export default PhysicianPortal;
