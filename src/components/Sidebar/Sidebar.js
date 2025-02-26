import React, { useState } from "react";
import { Container, Nav, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import { LuListTodo } from "react-icons/lu";
import { AiOutlineNodeIndex } from "react-icons/ai";
import WhitelistIndicator from "../WhitelistIndicator/WhitelistIndicator";
import TaskSection from "../TaskSection/TaskSection";
import IndexingSection from "../IndexingSection/IndexingSection";
import "../tooltip";
import "../base.css";
import "./Sidebar.css";

function Sidebar() {
  const [activeSection, setActiveSection] = useState("tasks");

  function exportBackup() {
    chrome.storage.local.get(null, (data) => {
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }


  function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      chrome.storage.local.set(data, () => {
        console.log("Backup restored.");
      });
    };
    reader.readAsText(file);
  }

  return (
    <Container className="sidebar">
      <Nav variant="tabs" className="mb-2 d-flex" style={{ paddingTop: "10px" }}>
        <Nav.Item>
          <label data-tooltip="To do" data-tooltip-position="bottom">
            <Nav.Link
              active={activeSection === "tasks"}
              onClick={() => setActiveSection("tasks")}
            >
              <LuListTodo className="icon" size={25} />
              <span style={{ marginLeft: "8px" }}>Tasks</span>
            </Nav.Link>
          </label>
        </Nav.Item>
        <Nav.Item>
          <label data-tooltip="Indexing" data-tooltip-position="bottom">
            <Nav.Link
              active={activeSection === "indexing"}
              onClick={() => setActiveSection("indexing")}
            >
              <AiOutlineNodeIndex className="icon" size={25} />
              <span style={{ marginLeft: "8px" }}>Indexing</span>
              <WhitelistIndicator />
            </Nav.Link>
          </label>
        </Nav.Item>
        <Nav.Item className="ms-auto">
          <label data-tooltip="Settings" data-tooltip-position="bottom">
            <Nav.Link
              active={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
            >
              <FaCog size={25} />
            </Nav.Link>
          </label>
        </Nav.Item>
      </Nav>

      {/* Conditionally Render Sections */}
      {activeSection === "tasks" && <TaskSection />}
      {activeSection === "indexing" && <IndexingSection />}
      {activeSection === "settings" && (
        <div>
          <h5>Backup & Restore</h5>
          <Button onClick={exportBackup} variant="primary" className="m-2">export data</Button>
          <input type="file" onChange={importBackup} className="m-2" />
        </div>
      )}
    </Container>
  );
}

export default Sidebar;
