"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NotificationPopup from "./popup";

export default function NotesGrid({ notes }) {
    const [selectedNote, setSelectedNote] = useState(null);
    const [updatedTitle, setUpdatedTitle] = useState("");
    const [updatedContent, setUpdatedContent] = useState("");
  

    const router = useRouter();

    const handleNoteClick = (note) => {
        setSelectedNote(note);
        setUpdatedTitle(note.title);     // initialize inputs
        setUpdatedContent(note.content); // initialize inputs
    };

    const closeModal = () => {
        setSelectedNote(null);
    };

    async function updateHandler() {
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

            // Optionally: close modal or refresh notes
            closeModal();
            router.push('/');
        } catch (error) {
            console.error("Error updating note:", error);
        }


    }
    async function deleteHandler() {
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
            closeModal();
            router.push('/');
    
        } catch (error) {
            console.error("Error updating note:", error);
        }
    }

    return (
        <div>
            {/* Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(notes) &&
                    notes.map((note, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleNoteClick(note)}
                            className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition text-left w-full"
                        >
                            <h3 className="text-blue-400">id: {note.id}</h3>
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
                                Update
                            </button>
                            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={deleteHandler}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
