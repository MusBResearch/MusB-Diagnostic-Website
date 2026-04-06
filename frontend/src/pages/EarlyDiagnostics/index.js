import React from 'react';
import PlaceholderPage from '../PlaceholderPage';
import { Microscope } from 'lucide-react';

const EarlyDiagnostics = () => {
  return (
    <PlaceholderPage 
      title="Early Diagnostics & Biomarker Validation" 
      icon={<Microscope size={48} />}
      description="Supporting innovative research into early-stage diagnostic assays and longitudinal biomarker tracking."
    />
  );
};

export default EarlyDiagnostics;
