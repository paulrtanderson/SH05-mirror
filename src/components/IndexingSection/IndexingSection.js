import React, { useState, useEffect } from "react";
import { Container, Nav } from "react-bootstrap";
import IndexInput from "../IndexInput/IndexInput";
import IndexList from "../IndexList/IndexList";
import "./IndexingSection.css";
import useIndexMatching from "../../hooks/useIndexMatching/useIndexMatching";

const IndexingSection = () => {
  const [activeIndexSection, setActiveIndexSection] = useState("allowedSites");
  const {
    allowedSites, allowedRegex, allowedURLs, allowedStringMatches,
    setAllowedSites, setAllowedRegex, setAllowedURLs, setAllowedStringMatches
  } = useIndexMatching();

  const sections = [
    { key: "allowedSites", label: "Sites" },
    { key: "allowedUrls", label: "URLs" },
    { key: "stringmatches", label: "String Matches" },
    { key: "regex", label: "RegEx" },
  ];

  const sectionFunctions = {
    allowedSites: { add: addSite, remove: removeSite, update: updateSite },
    regex: { add: addRegex, remove: removeRegex, update: updateRegex },
    allowedURLs: { add: addUrl, remove: removeUrl, update: updateUrl },
    stringmatches: { add: addStringMatch, remove: removeStringMatch, update: updateStringMatch }
  };

  const sectionItems = {
    allowedSites:allowedSites,
    regex: allowedRegex,
    allowedURLs:allowedURLs,
    stringmatches: allowedStringMatches
  };


  return (
    <Container className="indexing-section">
      <Nav variant="tabs" activeKey={activeIndexSection} onSelect={setActiveIndexSection}>
        {[
          { key: "allowedSites", label: "Sites" },
          { key: "allowedUrls", label: "URLs" },
          { key: "stringmatches", label: "String Matches" },
          { key: "regex", label: "RegEx" },
        ].map((section) => (
          <Nav.Item key={section.key}>
            <Nav.Link eventKey={section.key} className={`subnav-link ${activeIndexSection === section.key ? "active" : ""}`}>
              {section.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <div className="indexing-box">
        <h2 className="section-title">
          Showing {activeIndexSection} List
        </h2>

        <IndexInput {...sectionFunctions[activeIndexSection]} />
      </div>

      <IndexList items={sectionItems[activeIndexSection]} />
    </Container>
  );
};

export default IndexingSection;
