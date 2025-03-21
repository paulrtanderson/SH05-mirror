import React, { useState, useEffect } from "react";
import { Nav, Button } from "react-bootstrap";
import { MdRestore } from "react-icons/md";
import "../tooltip";
import "../base.css";
import IndexInput from "../IndexInput/IndexInput";
import IndexList from "../IndexList/IndexList";
import RecoverDeletedIndex from "../RecoverDeletedIndex/RecoverDeletedIndex";
import "./IndexingSection.css";
import useIndexMatching from "../../hooks/useIndexMatching/useIndexMatching";

const IndexingSection = () => {
  const [activeIndexSection, setActiveIndexSection] = useState("allowedSites");
  const [showRecoverPage, setShowRecoverPage] = useState(false);

  const {
    rules,
    deletedRules,
    addRule,
    removeRule,
    recoverRule,
    checkCurrentUrl,
  } = useIndexMatching();

  const sections = [
    { key: "allowedSites", label: "Sites" },
    { key: "allowedURLs", label: "URLs" },
    { key: "allowedStringMatches", label: "String Matches" },
    { key: "allowedRegex", label: "RegEx" },
  ];

  const handleOpenRecoverPage = (e) => {
    e.target.blur();
    document.dispatchEvent(new Event("click"));
    setTimeout(() => setShowRecoverPage(true), 50);
  };

  if (showRecoverPage) {
    return (
      <RecoverDeletedIndex
        deletedItems={deletedRules}
        onRecover={recoverRule}
        onBack={() => setShowRecoverPage(false)}
        onGoToIndexing={() => setShowRecoverPage(false)}
      />
    );
  }

  return (
    <>
      <div className="indexing-upper-container">
        <Nav
          variant="tabs"
          activeKey={activeIndexSection}
          onSelect={setActiveIndexSection}
        >
          {sections.map((section) => (
            <Nav.Item key={section.key}>
              <Nav.Link
                eventKey={section.key}
                className={`subnav-link ${
                  activeIndexSection === section.key ? "active" : ""
                }`}
                data-tooltip={section.label}
                data-tooltip-position="top"
              >
                {section.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
        <div className="indexing-input-box">
          <IndexInput add={addRule} activeIndexSection={activeIndexSection}/>
        </div>
      </div>

      <div className="list-name">
        <h2 className="section-title">
          Indexed {sections.find((s) => s.key === activeIndexSection)?.label}:
        </h2>
      </div>

      <div className="list-container">
        <IndexList
          items={rules[activeIndexSection]}
          onDelete={removeRule}
          activeIndexSection={activeIndexSection}
        />
      </div>

      <div className="recover-button-container">
        <Button data-testid="recover-button" onClick={handleOpenRecoverPage} data-tooltip= "Recover indexed links"
                data-tooltip-position="top" className="recover-button">
          <MdRestore size={24} />
        </Button>
      </div>
    </>
  );
};

export default IndexingSection;