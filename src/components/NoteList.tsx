import { useCallback, useEffect, useState } from 'react';
import { Container, Heading, Card, Tag } from '../styles/styled';
import { SpinnerContainer } from './LoadingSpinner';
import { Note,
  createNote, submitNote, deleteNote, editNote, refreshNotes, getNotes,
} from '../utils/notes'

import styled from 'styled-components';
import theme from '../styles/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

import NoteForm from './NoteForm';
import NoteItem from './NoteItem';
import OfflineIndicator from './OfflineIndicator';

const NotesContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 40px;
`;

const NoteListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  margin: auto;
`;

const NoteListLoadingSpinner = styled(SpinnerContainer)`
  margin-top: 24px;
  margin-bottom: 16px;
  align-self: center;
`;

const FilterContainer = styled(Card)`
  margin-bottom: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FilterTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: ${theme.colors.primary};
  font-size: 0.95rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterTag = styled(Tag)<{ isSelected: boolean }>`
  cursor: pointer;
  background-color: ${props => props.isSelected ? theme.colors.primary : theme.colors.background};
  color: ${props => props.isSelected ? 'white' : theme.colors.text};
  border-color: ${props => props.isSelected ? theme.colors.primary : theme.colors.border};
  
  &:hover {
    background-color: ${props => props.isSelected ? theme.colors.secondary : theme.colors.primary};
    color: white;
    border-color: ${props => props.isSelected ? theme.colors.secondary : theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: ${theme.colors.textLight};
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  border: 1px dashed ${theme.colors.border};
  margin: 24px 0;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 8px;
    color: ${theme.colors.text};
  }
  
  p {
    font-size: 1rem;
    max-width: 400px;
  }
`;

const NotesList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
`;

export default function NoteList() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Collect all unique tags from notes
  const allTags = Array.from(
    new Set(
      allNotes.flatMap(note => note.tags || [])
    )
  );

  // Filter notes by selected tags (must match all selected tags)
  const filteredNotes = selectedTags.length === 0
    ? allNotes
    : allNotes.filter(note =>
        selectedTags.every(tag => note.tags && note.tags.includes(tag))
      );

  const handleNoteSubmit = useCallback(async (noteTitle: string, tags: string[]) => {
    const note: Note = createNote(noteTitle, tags);
    await submitNote(note);
    setAllNotes(await getNotes());
  }, []);

  const handleNoteDelete = useCallback(async (noteId: string) => {
    await deleteNote(noteId);
    setAllNotes(await getNotes());
  }, []);

  const handleEditNote = useCallback(async (noteId: string, updatedTitle: string, updatedTags?: string[]) => {
    await editNote(noteId, updatedTitle, updatedTags);
    setAllNotes(await getNotes());
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      await refreshNotes();
      setAllNotes(await getNotes());
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { type: 'module' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          window.addEventListener('online', async () => {
            registration.sync.register('sync-notes')
              .then(() => {
                console.log('Sync event registered');
              })
              .catch((error) => {
                console.error('Sync event registration failed:', error);
              });
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    window.addEventListener('online', async () => {
      await fetchNotes();
    })

  }, [fetchNotes]);

  // Tag filter UI
  const handleTagFilterChange = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <NotesContainer>
      <Heading>My Notes</Heading>
      <NoteListWrapper>
        <NoteForm onNoteSubmit={handleNoteSubmit} />
        
        {/* Tag Filter UI */}
        {allTags.length > 0 && (
          <FilterContainer>
            <FilterTitle>
              <FontAwesomeIcon icon={faFilter} />
              Filter notes by tags
            </FilterTitle>
            <TagsContainer>
              {allTags.map(tag => (
                <FilterTag 
                  key={tag} 
                  isSelected={selectedTags.includes(tag)}
                  onClick={() => handleTagFilterChange(tag)}
                >
                  {tag}
                </FilterTag>
              ))}
            </TagsContainer>
          </FilterContainer>
        )}
        
        {loading && <NoteListLoadingSpinner />}
        
        {filteredNotes.length > 0 ? (
          <NotesList>
            {filteredNotes.map((note, index) => (
              <NoteItem key={index} note={note} onDeleteNote={handleNoteDelete} onEditNote={handleEditNote} />
            ))}
          </NotesList>
        ) : (
          <EmptyState>
            <h3>No notes found</h3>
            <p>
              {selectedTags.length > 0 
                ? 'Try changing your tag filters or create a new note with these tags.'
                : 'Get started by creating your first note above!'}
            </p>
          </EmptyState>
        )}
      </NoteListWrapper>
      <OfflineIndicator />
    </NotesContainer>
  );
}