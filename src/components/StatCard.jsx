import React from 'react';
export default function StatCard({ icon: Icon, label, value, unit, foot, tone = 'lime' }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-top"><span className="stat-icon"><Icon size={17} strokeWidth={1.8} /></span><span className="stat-foot">{foot}</span></div>
      <div className="stat-value">{value}<small>{unit}</small></div>
      <div className="stat-label">{label}</div>
    </article>
  );
}
