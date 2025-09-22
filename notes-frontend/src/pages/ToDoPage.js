import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [priority, setPriority] = useState("Low");
  const navigate = useNavigate();

  // Get user name from localStorage or fallback
  const userName = localStorage.getItem("userName") || "Nana";

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const note = {
      id: Date.now(),
      text: newNote,
      priority,
    };

    setNotes([note, ...notes]);
    setNewNote("");
    setPriority("Low");
  };

  const handleDelete = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleEdit = (id) => {
    const currentNote = notes.find((n) => n.id === id);
    const updatedText = prompt("Edit your note:", currentNote.text);
    const updatedPriority = prompt(
      "Edit priority (Low, Medium, High):",
      currentNote.priority
    );

    if (updatedText && updatedPriority) {
      setNotes(
        notes.map((n) =>
          n.id === id
            ? { ...n, text: updatedText, priority: updatedPriority }
            : n
        )
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userName"); // clear name on logout
    navigate("/login");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Header */}
      <header className="w-full max-w-3xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">
          Welcome, {userName} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      {/* Links to Notes & To-Do */}
      <div className="w-full max-w-3xl flex gap-4 mb-6">
        <Link
          to="/notes"
          className="flex-1 text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ➕ Create Note
        </Link>
        <Link
          to="/todo"
          className="flex-1 text-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          ➕ Add Task
        </Link>
      </div>

      {/* New Note Form */}
      <form
        onSubmit={handleAddNote}
        className="w-full max-w-3xl flex gap-2 mb-6"
      >
        <input
          type="text"
          placeholder="Write a quick note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {/* Notes List */}
      <div className="w-full max-w-3xl space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center">
            No notes yet. Start by adding one!
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow"
            >
              <div>
                <p className="font-medium">{note.text}</p>
                <span
                  className={`inline-block mt-1 px-2 py-1 text-sm rounded ${getPriorityColor(
                    note.priority
                  )}`}
                >
                  {note.priority} Priority
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(note.id)}
                  className="px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
