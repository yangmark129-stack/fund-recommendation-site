import React from 'react';
import FundCard from './FundCard';
import EmptyState from './EmptyState';

export default function FundList({ funds }) {
  if (funds.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="fund-grid" aria-label="主题关联基金列表">
      {funds.map((fund) => (
        <FundCard key={fund.code} fund={fund} />
      ))}
    </section>
  );
}
