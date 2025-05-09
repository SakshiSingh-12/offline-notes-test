import axios from 'axios';
import {
  storeOfflineNote,
  getOfflineNote,
  getOfflineNotes,
  deleteOfflineNote,
  editOfflineNote
} from '../../public/indexeddb';

export interface Note {
  _id?: number;
  localId?: string;
  localDeleteSynced?: boolean;
  localEditSynced?: boolean;
  title: string;
  createdAt: Date;
  tags?: string[];
}

export function createNote(title: string, tags: string[] = []): Note {
  return {
    title,
    localId: crypto.randomUUID(),
    createdAt: new Date(),
    tags
  };
}

function createServerNote(note: Note): Note {
  return {
    title: note.title,
    localId: note.localId,
    createdAt: note.createdAt,
    tags: note.tags || []
  };
}

export async function submitNote(note: Note): Promise<void> {
  await storeOfflineNote(note);

  if (navigator.onLine) {
    try {
      const response = await fetch('/api/save-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createServerNote(note)),
      });

      if (response.ok) {
        const data = await response.json();
        note._id = data.insertedId;
        await editOfflineNote(note);
      } else {
        console.error('Failed to submit note:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting note:', error);
    }
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  try {
    const note = await getOfflineNote(noteId);
    if (!note) return;

    if (!note._id) {
      await deleteOfflineNote(noteId);
    } else if (navigator.onLine) {
      try {
        await deleteOfflineNote(noteId);
        await axios.delete(`/api/delete-note?id=${note._id}`);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    } else {
      note.localDeleteSynced = false;
      await editOfflineNote(note);
    }
  } catch (error) {
    console.error('Failed to delete note:', error);
  }
}

export async function editNote(noteId: string, updatedTitle: string, updatedTags?: string[]): Promise<void> {
  try {
    const note = await getOfflineNote(noteId);
    if (!note) return;

    note.title = updatedTitle;
    if (updatedTags !== undefined) note.tags = updatedTags;

    if (!note._id) {
      await editOfflineNote(note);
    } else if (navigator.onLine) {
      try {
        await axios.put(`/api/edit-note?id=${note._id}`, {
          title: updatedTitle,
          tags: updatedTags ?? note.tags
        });
        note.localEditSynced = undefined;
        await editOfflineNote(note);
      } catch (error) {
        console.error('Error editing note:', error);
        note.localEditSynced = false;
        await editOfflineNote(note);
      }
    } else {
      note.localEditSynced = false;
      await editOfflineNote(note);
    }
  } catch (error) {
    console.error('Failed to edit note:', error);
  }
}

export async function updateSavedNote(serverNote: Note, localNotes: Note[]): Promise<void> {
  const match = localNotes.find((n: Note) => n._id === serverNote._id);

  if (!match) {
    const unsynced = localNotes.find((n: Note) => n.localId === serverNote.localId);
    if (unsynced) {
      unsynced._id = serverNote._id;
      await editOfflineNote(unsynced);
    } else {
      serverNote.localId = crypto.randomUUID();
      await storeOfflineNote(serverNote);
    }
  }
}

export async function updateEditedNote(serverNote: Note, localNotes: Note[]): Promise<void> {
  const match = localNotes.find((n: Note) => n._id === serverNote._id);
  if (!match) return;

  if (match.localEditSynced === false) {
    try {
      await axios.put(`/api/edit-note?id=${match._id}`, {
        title: match.title,
        tags: match.tags
      });
      match.localEditSynced = undefined;
      await editOfflineNote(match);
    } catch (error) {
      console.error('Error syncing edited note:', error);
    }
  } else {
    match.title = serverNote.title;
    match.tags = serverNote.tags;
    await editOfflineNote(match);
  }
}

export async function updateDeletedNote(serverId: number, localNotes: Note[]): Promise<void> {
  const match = localNotes.find((n: Note) => n._id === serverId);
  if (match) {
    await deleteOfflineNote(match.localId!);
  }
}

export async function refreshNotes(): Promise<void> {
  if (!navigator.onLine) return;

  try {
    const localNotes = await getOfflineNotes();
    const serverRes = await axios.get('/api/notes');
    const serverNotes: Note[] = serverRes.data;

    for (const localNote of localNotes) {
      if (localNote.localEditSynced === false && localNote._id !== undefined) {
        const serverNote = serverNotes.find((sn: Note) => sn._id === localNote._id);
        if (serverNote) {
          const tagsA = localNote.tags?.sort() ?? [];
          const tagsB = serverNote.tags?.sort() ?? [];
          const titleConflict = localNote.title !== serverNote.title;
          const tagsConflict = JSON.stringify(tagsA) !== JSON.stringify(tagsB);

          if (titleConflict || tagsConflict) {
            console.warn('[CONFLICT DETECTED]', {
              noteId: localNote._id,
              localTitle: localNote.title,
              serverTitle: serverNote.title,
              localTags: tagsA,
              serverTags: tagsB
            });
          }
        }
      }
    }

    for (const note of localNotes) {
      if (note.localDeleteSynced === false && note._id !== undefined) {
        const exists = serverNotes.find((sn: Note) => sn._id === note._id);
        if (exists) {
          await deleteOfflineNote(note.localId!);
          await axios.delete(`/api/delete-note?id=${note._id}`);
        }
      } else if (!note._id) {
        try {
          const res = await fetch('/api/save-note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createServerNote(note)),
          });

          if (res.ok) {
            const data = await res.json();
            note._id = data.insertedId;
            await editOfflineNote(note);
          } else {
            console.error('Sync failed:', res.statusText);
          }
        } catch (err) {
          console.error('Error syncing note:', err);
        }
      }
    }

    const refreshedNotes = await getOfflineNotes();
    const latestServerRes = await axios.get('/api/notes');
    const latestServerNotes: Note[] = latestServerRes.data;

    for (const sn of latestServerNotes) {
      await updateSavedNote(sn, refreshedNotes);
      await updateEditedNote(sn, refreshedNotes);
    }
  } catch (error) {
    console.error('Error refreshing notes:', error);
  }
}

export async function getNotes(): Promise<Note[]> {
  const notes = await getOfflineNotes();
  notes.sort((a: Note, b: Note) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return notes;
}
