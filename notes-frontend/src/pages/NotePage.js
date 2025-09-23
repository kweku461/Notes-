// src/pages/NotePage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./NotePage.css";
import { showToast } from "../utils/toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import axios from "axios";

function NotePage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  // UI states
  const [showMenu, setShowMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showHomeMenu, setShowHomeMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [theme, setTheme] = useState("light");

  // Sections
  const [sections, setSections] = useState([{ id: 1, title: "Untitled Section" }]);
  const [activeSectionId, setActiveSectionId] = useState(1);
  const [renamingSectionId, setRenamingSectionId] = useState(null);

  // Pages
  const [pages, setPages] = useState([
    { id: 1, sectionId: 1, title: "Untitled Page", content: "", noteId: null },
  ]);
  const [activePageId, setActivePageId] = useState(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [pageContextMenu, setPageContextMenu] = useState(null);

  const activePage = pages.find((p) => p.id === activePageId);

  // Theme toggle
  const toggleTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    document.body.setAttribute("data-theme", selectedTheme);
    showToast(`Theme switched to ${selectedTheme}`);
  };

  // User info
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", initials: "" });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      const initials = savedUser.name
        ? savedUser.name
            .split(" ")
            .map((n) => n[0].toUpperCase())
            .join("")
        : savedUser.email?.[0]?.toUpperCase() || "U";

      setUser({
        name: savedUser.name || "Unnamed User",
        email: savedUser.email || "",
        initials,
      });
    }
  }, []);

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // ===== FETCH NOTE =====
  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast("⚠️ You must be logged in!");
          return;
        }

        const res = await axios.get(`http://localhost:4000/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        const newPageId = Date.now();

        setPages([
          {
            id: newPageId,
            sectionId: activeSectionId,
            title: data.title || "Untitled Page",
            content: data.content || "",
            noteId: data.id,
          },
        ]);
        setActivePageId(newPageId);
        showToast("✅ Note loaded!");
      } catch (err) {
        console.error("❌ Error fetching note:", err.response?.data || err.message);
        showToast("❌ Failed to load note!");
      }
    };

    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ===== PAGE HANDLERS =====
  const handleAddPage = () => {
    const newPage = {
      id: Date.now(),
      sectionId: activeSectionId,
      title: "Untitled Page",
      content: "",
      noteId: null,
    };
    setPages([...pages, newPage]);
    setActivePageId(newPage.id);
    showToast("➕ Page added!");
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value || "Untitled Page";
    setPages(
      pages.map((page) =>
        page.id === activePageId ? { ...page, title: newTitle } : page
      )
    );
  };

  const handleContentChange = (content) => {
    setPages(
      pages.map((page) =>
        page.id === activePageId ? { ...page, content } : page
      )
    );
  };

  const handleDeletePage = (id) => {
    if (pages.length === 1) {
      showToast("⚠️ You need at least one page!");
      return;
    }
    setPages(pages.filter((p) => p.id !== id));
    if (activePageId === id) {
      const remaining = pages.filter((p) => p.id !== id);
      setActivePageId(remaining[0].id);
    }
    showToast("❌ Page deleted!");
  };

  // ===== SAVE / UPDATE =====
  const handleSave = async () => {
    if (!activePage) return showToast("⚠️ No active page!");

    try {
      const token = localStorage.getItem("token");
      if (!token) return showToast("⚠️ You must be logged in!");

      const noteData = {
        title: activePage.title,
        content: activePage.content,
      };

      let response;
      if (id || activePage.noteId) {
        const targetId = id || activePage.noteId;
        response = await axios.put(
          `http://localhost:4000/notes/${targetId}`,
          noteData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("✏️ Note updated!");
      } else {
        response = await axios.post("http://localhost:4000/notes", noteData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newNoteId = response.data.id;
        setPages(
          pages.map((page) =>
            page.id === activePageId ? { ...page, noteId: newNoteId } : page
          )
        );
        showToast("💾 Note saved!");
      }

      console.log("✅ Backend response:", response.data);
    } catch (err) {
      console.error("❌ Save error:", err.response?.data || err.message);
      showToast("❌ Failed to save note!");
    }
  };

  // ===== SECTION HANDLERS =====
  const handleAddSection = () => {
    const newSection = { id: Date.now(), title: "Untitled Section" };
    setSections([...sections, newSection]);
    setActiveSectionId(newSection.id);
    showToast("📑 Section added!");
  };

  const handleRenameSection = (id, newTitle) => {
    setSections(
      sections.map((s) =>
        s.id === id ? { ...s, title: newTitle || "Untitled Section" } : s
      )
    );
    setRenamingSectionId(null);
  };

  const handleDeleteSection = (id) => {
    if (sections.length === 1) {
      showToast("⚠️ You need at least one section!");
      return;
    }
    setSections(sections.filter((s) => s.id !== id));
    setPages(pages.filter((p) => p.sectionId !== id));
    if (activeSectionId === id) {
      setActiveSectionId(sections[0].id);
    }
    showToast("❌ Section deleted!");
  };

  // ===== CONTEXT MENUS =====
  const handleContextMenu = (e, sectionId) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX - 2, mouseY: e.clientY - 4, sectionId });
  };

  const handlePageContextMenu = (e, pageId) => {
    e.preventDefault();
    setPageContextMenu({ mouseX: e.clientX - 2, mouseY: e.clientY - 4, pageId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
    setPageContextMenu(null);
  };

  return (
    <div className="note-page" onClick={closeContextMenu}>
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            ☰
          </button>
          <img src="/images/Logo.png" alt="Note Logo" className="logo" />
          {showMenu && (
            <div className="menu-popup">
              <button onClick={() => navigate("/dashboard")}>📂 Dashboard</button>
              <button onClick={() => navigate("/notes")}>📝 Notes</button>
            </div>
          )}
        </div>

        <div className="navbar-right">
          <input type="text" className="search-box" placeholder="🔍 Search Notes" />
          <button
            className="settings-btn"
            onClick={() => {
              setShowSettings(!showSettings);
              setShowAppearance(false);
            }}
          >
            ⚙️
          </button>

          {showSettings && (
            <div className="settings-popup">
              <div
                className="settings-item"
                onClick={() => setShowAppearance(!showAppearance)}
              >
                Appearance ▶
              </div>
              {showAppearance && (
                <div className="appearance-submenu">
                  <div
                    className={`appearance-option ${theme === "light" ? "active" : ""}`}
                    onClick={() => toggleTheme("light")}
                  >
                    🌞 Light
                  </div>
                  <div
                    className={`appearance-option ${theme === "dark" ? "active" : ""}`}
                    onClick={() => toggleTheme("dark")}
                  >
                    🌙 Dark
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="user-circle" onClick={() => setShowPopup(!showPopup)}>
            {user.initials || "U"}
            {showPopup && (
              <div className="user-popup">
                <p>{user.name}</p>
                <p className="user-email">{user.email}</p>
                <button className="signout-btn" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Secondary Nav */}
      <div className="secondary-nav">
        <span
          className="nav-item"
          onClick={() => {
            setShowFileMenu(!showFileMenu);
            setShowHomeMenu(false);
            setShowHelpMenu(false);
          }}
        >
          File
        </span>
        {showFileMenu && (
          <div className="popup-menu">
            <div onClick={handleSave}>
              {id || activePage?.noteId ? "✏️ Update" : "💾 Save"}
            </div>
            <div onClick={() => showToast("📤 Exporting as PDF...")}>
              📤 Export as PDF
            </div>
            <div onClick={() => showToast("❌ Note deleted!")} className="danger">
              ❌ Delete Note
            </div>
          </div>
        )}

        <span
          className="nav-item"
          onClick={() => {
            setShowHomeMenu(!showHomeMenu);
            setShowFileMenu(false);
            setShowHelpMenu(false);
          }}
        >
          Home
        </span>
        {showHomeMenu && (
          <div className="popup-menu">
            <div onClick={handleAddPage}>➕ Add Page</div>
            <div onClick={handleAddSection}>📑 Add Section</div>
            <div onClick={() => showToast("🖼️ Insert image...")}>🖼️ Insert Image</div>
          </div>
        )}

        <span
          className="nav-item"
          onClick={() => {
            setShowHelpMenu(!showHelpMenu);
            setShowFileMenu(false);
            setShowHomeMenu(false);
          }}
        >
          Help
        </span>
        {showHelpMenu && (
          <div className="popup-menu">
            <div onClick={() => showToast("ℹ️ Notes App v1.0 🚀")}>ℹ️ About</div>
            <div
              onClick={() =>
                showToast("⌨️ Shortcuts: Ctrl+S Save, Ctrl+B Bold")
              }
            >
              ⌨️ Shortcuts
            </div>
          </div>
        )}
      </div>

      {/* Main Notes Layout */}
      <div className="notes-layout">
        {/* Sections Sidebar / Row */}
        <div className="side-column sections-container">
          <button className="sidebar-tab" onClick={handleAddSection}>
            + Add section
          </button>
          <div className="sections-list scrollable-row">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`section-item ${section.id === activeSectionId ? "active" : ""}`}
                onClick={() => setActiveSectionId(section.id)}
                onContextMenu={(e) => handleContextMenu(e, section.id)}
              >
                {renamingSectionId === section.id ? (
                  <input
                    type="text"
                    defaultValue={section.title}
                    autoFocus
                    onBlur={(e) => handleRenameSection(section.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameSection(section.id, e.target.value);
                      }
                    }}
                  />
                ) : (
                  <span>{section.title}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="divider"></div>

        {/* Pages Sidebar / Row */}
        <div className="side-column pages-container">
          <button className="sidebar-tab" onClick={handleAddPage}>
            + Add page
          </button>
          <div className="pages-list scrollable-row">
            {pages
              .filter((p) => p.sectionId === activeSectionId)
              .map((page) => (
                <div
                  key={page.id}
                  className={`page-item ${page.id === activePageId ? "active" : ""}`}
                  onClick={() => setActivePageId(page.id)}
                  onContextMenu={(e) => handlePageContextMenu(e, page.id)}
                >
                  {page.title}
                </div>
              ))}
          </div>
        </div>

        <div className="divider"></div>

        {/* Editor */}
        <div className="note-editor">
          <div className="mb-4">
            {isEditingTitle ? (
              <input
                type="text"
                value={activePage?.title === "Untitled Page" ? "" : activePage?.title}
                onChange={handleTitleChange}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
                placeholder="Enter title..."
                className="w-full text-2xl font-bold border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <h2
                className={`text-2xl font-bold text-gray-700 cursor-text ${
                  activePage?.title ? "" : "italic text-gray-400"
                }`}
                onClick={() => setIsEditingTitle(true)}
              >
                {activePage?.title || "Title"}
              </h2>
            )}
          </div>

          <div className="note-editor-box">
            <ReactQuill
              theme="snow"
              value={activePage?.content || ""}
              onChange={handleContentChange}
              modules={{
                toolbar: [
                  [{ font: [] }, { size: [] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
              formats={[
                "font",
                "size",
                "bold",
                "italic",
                "underline",
                "strike",
                "list",
                "bullet",
                "link",
                "image",
              ]}
              placeholder="Write your notes here..."
            />
          </div>
        </div>
      </div>

      {/* Context Menus */}
      {contextMenu && (
        <div
          className="context-popup"
          style={{ top: contextMenu.mouseY, left: contextMenu.mouseX, position: "absolute" }}
        >
          <div className="context-item" onClick={() => setRenamingSectionId(contextMenu.sectionId)}>
            ✏️ Rename Section
          </div>
          <div className="context-item" onClick={handleAddSection}>
            ➕ New Section
          </div>
          <div className="context-item danger" onClick={() => handleDeleteSection(contextMenu.sectionId)}>
            ❌ Delete Section
          </div>
        </div>
      )}

      {pageContextMenu && (
        <div
          className="context-popup"
          style={{ top: pageContextMenu.mouseY, left: pageContextMenu.mouseX, position: "absolute" }}
        >
          <div className="context-item" onClick={() => setIsEditingTitle(true)}>
            ✏️ Rename Page
          </div>
          <div className="context-item" onClick={handleAddPage}>
            ➕ New Page
          </div>
          <div className="context-item danger" onClick={() => handleDeletePage(pageContextMenu.pageId)}>
            ❌ Delete Page
          </div>
        </div>
      )}
    </div>
  );
}

export default NotePage;
