import React from 'react';

// Title + optional subtitle on the left, optional actions on the right.
const PageHead = ({ title, subtitle, children, as: Heading = 'h1', id }) => (
  <header className="page-head">
    <div className="page-head-text">
      <Heading id={id} className="page-title">{title}</Heading>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {children}
  </header>
);

export default PageHead;
