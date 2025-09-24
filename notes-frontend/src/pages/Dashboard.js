import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState({ name: "", email: "", initials: "" });
  const [notes, setNotes] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://notes-e7ee.onrender.com"; // ✅ hardcoded backend URL

  useEffect(() => {
    // Load user info
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

    // Load theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute("data-theme", savedTheme);
    }

    // Fetch notes
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found, cannot fetch notes.");
          return;
        }

        const res = await fetch(`${API_URL}/notes`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch notes: ${res.status}`);

        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error("❌ Error fetching notes:", err);
      }
    };

    fetchNotes();
  }, []);

  // Highlight helper
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark key={idx} className="highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Theme
  const toggleTheme = (mode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    document.body.setAttribute("data-theme", mode);
  };

  // Right-click
  const handleContextMenu = (e, noteId) => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      noteId,
    });
  };

  // Delete
  const handleDeleteNote = async (noteId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("❌ Failed to delete note");

      setNotes(notes.filter((n) => n.id !== noteId));
      setContextMenu(null);
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  // Edit
  const handleEditNote = (noteId) => {
    navigate(`/notes/${noteId}`);
    setContextMenu(null);
  };

  // ✅ Filter notes by search term
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(note.updatedAt)
        .toLocaleString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard" onClick={() => setContextMenu(null)}>
      {/* Navbar */}
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
          <input
            type="text"
            className="search-box"
            placeholder="🔍 Search Notes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                    className={`appearance-option ${
                      theme === "light" ? "active" : ""
                    }`}
                    onClick={() => toggleTheme("light")}
                  >
                    🌞 Light
                  </div>
                  <div
                    className={`appearance-option ${
                      theme === "dark" ? "active" : ""
                    }`}
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

      {/* Banner */}
      <div className="banner">
        <img src="/images/Rectangle 4.png" alt="Banner" className="banner-img" />
        <div className="banner-actions">
          <button className="create-btn" onClick={() => navigate("/notes")}>
            + Create New Note
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <h2>My Notes</h2>
        <div className="notes-container">
          <div className="notes-card">
            {filteredNotes.length === 0 ? (
              <p>No notes found.</p>
            ) : (
              <table className="notes-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Opened</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotes.map((note) => (
                    <tr
                      key={note.id}
                      onClick={() => navigate(`/notes/${note.id}`)}
                      onContextMenu={(e) => handleContextMenu(e, note.id)}
                      className="note-row"
                    >
                      <td>
                        <span className="note-icon">📝</span>
                        <span className="note-title">
                          {highlightMatch(note.title, searchTerm)}
                        </span>
                      </td>
                      <td>
                        {highlightMatch(
                          new Date(note.updatedAt).toLocaleString(),
                          searchTerm
                        )}
                      </td>
                      <td>{highlightMatch(user.name, searchTerm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-popup"
          style={{
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
            position: "absolute",
          }}
        >
          <div
            className="context-item"
            onClick={() => handleEditNote(contextMenu.noteId)}
          >
            ✏️ Edit Note
          </div>
          <div
            className="context-item danger"
            onClick={() => handleDeleteNote(contextMenu.noteId)}
          >
            ❌ Delete Note
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
