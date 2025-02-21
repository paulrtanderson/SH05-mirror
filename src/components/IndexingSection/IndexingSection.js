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

  useEffect(() => {
    chrome.storage.local.get(["allowedSites", "allowedURLs", "allowedRegex", "allowedStringMatches"], (data) => {
      if (data.allowedSites) setAllowedSites(data.allowedSites);
      if (data.allowedURLs) setAllowedURLs(data.allowedURLs);
      if (data.allowedRegex) setAllowedRegex(data.allowedRegex);
      if (data.allowedStringMatches) setAllowedStringMatches(data.allowedStringMatches);
      console.log("Backup: Indexing settings restored.");
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({
      allowedSites, allowedURLs, allowedRegex, allowedStringMatches
    }, () => {
      console.log("Backup: Indexing settings saved.");
    });
  }, [allowedSites, allowedURLs, allowedRegex, allowedStringMatches]);

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
