"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationPopup from "@/lib/popup";
import NotesGrid from "@/lib/notesgrid";
import { POST } from "../api/login/route";
export default function Dashboard() {
  const [notes, setNotes] = useState([{}]);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });
  const [selectedNote, setSelectedNote] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");
  const [invite, setInvite] = useState({ email: "", role: "Member" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [tenant, setTenant] = useState("");
  const [upgrading, setUpgrading]= useState(false);
  const [adding, setAdding]= useState(false);
  const [deleting, setDeleting]= useState(false);
  const [updating, setUpdating]= useState(false);
  useEffect(() => {
    const role = (localStorage.getItem("role") === 'Admin');
    const email = localStorage.getItem("userEmail");
    const tenantData = localStorage.getItem("tenant");

    setIsAdmin(role);
    setUserEmail(email);
    setTenant(tenantData);
  }, []);

  const router = useRouter();
  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch("/api/notes");
        const data = await res.json();
        setNotes(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    }
    fetchNotes();
  }, []);

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setUpdatedTitle(note.title);     // initialize inputs
    setUpdatedContent(note.content); // initialize inputs
  };

  const closeModal = () => {
    setSelectedNote(null);
  };

  async function updateHandler() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/notes/${selectedNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: updatedTitle,
          content: updatedContent,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update note");

      }

      const data = await res.json();
      console.log("Note updated successfully:", data);
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === selectedNote.id
            ? { ...n, title: updatedTitle, content: updatedContent }
            : n
        )
      );
      // Optionally: close modal or refresh notes
      setNotification({ message: "Note updated successfully!", type: "success" });
      setUpdating(false);
      closeModal();

    } catch (error) {
      console.error("Error updating note:", error);
    }


  }
  async function deleteHandler() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${selectedNote.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!res.ok) {
        throw new Error("Failed to update note");
      }

      const data = await res.json();
      console.log("Note updated successfully:", data);

      // Optionally: close modal or refresh notes
      setNotes((prevNotes) =>
        prevNotes.filter((n) => n.id !== selectedNote.id)
      );
      setNotification({ message: "Note Deleted successfully!", type: "success" });
      setDeleting(false);
      closeModal();


    } catch (error) {
      console.error("Error updating note:", error);
    }
  }


  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  const handleCreate = () => {
    setShowModal(true);
  };
  const handleInvite = () => {
    setShowInvite(true);
  };
  const handleAddMember = async (e) => {
    setAdding(true);
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`/api/tenants/${tenant}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: invite.email,
          role: invite.role
        }),
      });
      const data = await res.json();
      console.log(data);
      if (data.ok) {
        setNotification({ message: 'Added successfully', type: "success" });
      } else {
        setNotification({ message: data.message, type: "fail" });

      }

    } catch (e) {
      setNotification({ message: e, type: "fail" });
    }
    setAdding(false);
    setShowInvite(false);
  }
  const handleEdit = () => {
    setShowEdit(true);
  };
  const handleBuy = async (e) => {
    setUpgrading(true);
    e.preventDefault();
    console.log("reached hanldBuy");
    try {
      console.log("reached hanldBuy true");
      const res = await fetch(`/api/tenants/${tenant}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      console.log("reached hanldBuy true2");
      if (data.ok) {

        setNotification({ message: data.message, type: "success" });
      } else {
        setNotification({ message: data.message, type: "fail" });
      }
    } catch (e) {
      setNotification({ message: e, type: "fail" });
    }
    setUpgrading(false);
    setShowEdit(false);

  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(newNote)
      setCreating(true);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newNote.title,
          content: newNote.content,
        }),
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        const createdNote = data;
        setNotes([createdNote, ...notes]); // Add new note to list

        setNewNote({ title: "", content: "" });
        setNotification({ message: "Note created successfully!", type: "success" });
      }
      else if (res.status == 403) {


        setNotification({ message: "Upgrade to Pro, Only admin can Upgrade the plan", type: "fail" });
      } else {

        setNotification({ message: "Something went wrong ", type: "fail" });
      }
      setCreating(false);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <NotificationPopup
        message={
          notification.message instanceof Error
            ? notification.message.message // show actual error text
            : notification.message
        }
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "success" })}
      />
      {/* Top Bar */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <h2 className="text-black italic">User:<span className="p-2 text-green-700 bg-green-200 rounded-2xl">{userEmail}</span></h2>
        <h2 className="text-black italic">Tenant:<span className="p-2 text-green-700 bg-green-200 rounded-2xl">{tenant}</span></h2>
        <div className="flex gap-4">
          {
            isAdmin &&
            <>
              <button

                className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition" onClick={handleInvite}
              >
                Invite Employee
              </button>
              <button

                className="px-4 py-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition" onClick={handleEdit}
              >
                Upgrade
              </button>

            </>

          }

          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Create Note
          </button>


          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {/* <NotesGrid notes={notes}></NotesGrid> */}
      <div>
        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(notes) &&
            notes.map((note, idx) => (
              <button
                key={idx}
                onClick={() => handleNoteClick(note)}
                className="bg-white hover:cursor-pointer border-2 border-gray-500 border-dotted rounded-xl p-4 hover:shadow-lg transition text-left w-full  "
              >
                <h3 className="text-indigo-500">id: {note.id}</h3>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {note.title}
                </h1>
                <p className="text-gray-600 mb-3">{note.content}</p>
                <p className="text-sm text-gray-400">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
        </div>

        {/* Modal */}
        {selectedNote && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xl bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-[400px] relative">
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h3 className="text-blue-400 mb-2">id: {selectedNote.id}</h3>

              {/* Title input */}
              <input
                className="text-2xl font-bold text-gray-800 mb-2 w-full border rounded p-2"
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
              />

              {/* Content input */}
              <textarea
                className="text-gray-600 mb-4 w-full border rounded p-2"
                value={updatedContent}
                onChange={(e) => setUpdatedContent(e.target.value)}
              />

              <p className="text-sm text-gray-400 mb-6">
                {new Date(selectedNote.createdAt).toLocaleString()}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                  onClick={updateHandler}
                >
                  {updating? "Updating" :"Update" }
                  
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={deleteHandler}>
                  
                  {deleting ? "Deleting" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex justify-center items-center z-50 text-gray-700">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-xl  font-bold mb-4">Create New Note</h2>


            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Title"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Description"
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  {creating && "Creating..."}
                  {!creating && "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showInvite && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex justify-center items-center z-50 text-gray-700">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">Invite User</h2>

            <form className="flex flex-col gap-4">
              {/* Email Input */}
              <input
                type="email"
                placeholder="Enter email"
                value={invite.email}
                onChange={(e) =>
                  setInvite({ ...invite, email: e.target.value })
                }
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* Role Selection */}
              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="Admin"
                    checked={invite.role === "Admin"}
                    onChange={(e) =>
                      setInvite({ ...invite, role: e.target.value })
                    }
                  />
                  Admin
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="Member"
                    checked={invite.role === "Member"}
                    onChange={(e) =>
                      setInvite({ ...invite, role: e.target.value })
                    }
                    defaultChecked
                  />
                  Member
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button

                  className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
                  onClick={handleAddMember}
                >
                  {adding ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-bold mb-6 text-center text-gray-700">Upgrade Plan</h2>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                className="px-6 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                {upgrading ?"Upgrading...": "Upgrade to Pro"}
                
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
