import React from 'react';
import { CheckCircle2, Clock, ArrowRightCircle, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import CompanyStatusBadge from './CompanyStatusBadge';
import { formatDate } from '../utils/formatters';

// If you don't have a formatDate utility, here's a simple implementation
// Remove this if you already have a formatDate function in your project
const formatDateFallback = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Use the project's formatter if available, otherwise use the fallback
const formatDateString = formatDate || formatDateFallback;

const CompanyStatusTable = ({ companies, onViewDetails }) => {
  if (!companies || companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Building2 className="w-12 h-12 text-green-500/30 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No companies registered</h3>
        <p className="text-green-500/70 text-center max-w-md">
          You haven't registered any companies yet. Use the form to register your first company.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-green-500/20">
            <th className="py-4 px-4 text-left text-green-500 font-medium">Company Name</th>
            <th className="py-4 px-4 text-left text-green-500 font-medium">Registration #</th>
            <th className="py-4 px-4 text-left text-green-500 font-medium">Business Type</th>
            <th className="py-4 px-4 text-left text-green-500 font-medium">Status</th>
            <th className="py-4 px-4 text-left text-green-500 font-medium">Registered On</th>
            <th className="py-4 px-4 text-right text-green-500 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr 
              key={company.id} 
              className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
            >
              <td className="py-4 px-4 text-white font-medium">{company.company_name}</td>
              <td className="py-4 px-4 text-white/70">{company.company_registration_number}</td>
              <td className="py-4 px-4 text-white/70 capitalize">
                {company.business_type.replace('_', ' ')}
              </td>
              <td className="py-4 px-4">
                <CompanyStatusBadge status={company.is_verified} />
              </td>
              <td className="py-4 px-4 text-white/70">
                {formatDateString(company.created_at)}
              </td>
              <td className="py-4 px-4 text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => onViewDetails(company)}
                >
                  <span>Details</span>
                  <ArrowRightCircle className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyStatusTable;