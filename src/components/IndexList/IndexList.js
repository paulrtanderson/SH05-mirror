import React from 'react';
import './IndexList.css'; 

const IndexList = ({ items = [] }) => {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};

export default IndexList;