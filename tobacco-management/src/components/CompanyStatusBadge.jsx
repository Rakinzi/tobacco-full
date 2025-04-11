import React from 'react';
import { cn } from '../utils/cn';
import { CheckCircle2, Clock } from 'lucide-react';

const CompanyStatusBadge = ({ status }) => {
  const isVerified = status === true || status === 'verified';

  return (
    <div className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
      isVerified 
        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
    )}>
      {isVerified ? (
        <>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          <span>Verified</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3 mr-1" />
          <span>Pending Verification</span>
        </>
      )}
    </div>
  );
};

export default CompanyStatusBadge;