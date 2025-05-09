import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import SyncIndicator from './SyncIndicator'
import { Note } from '../utils/notes'
import { Button, Card, Tag, TextArea } from '../styles/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faEdit, faTimes, faSave, faTimes as faCancel } from '@fortawesome/free-solid-svg-icons';
import theme from '../styles/theme';

const NoteItemWrapper = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
`;

const NoteFrame = styled(Card)<{ isSubmitted?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem;
  margin-bottom: 0.25rem;
  width: 100%;
  word-wrap: break-word;
  overflow: visible;
  background-color: ${props => (!props.isSubmitted ? theme.colors.background : theme.colors.card)};
  transition: ${theme.transitions.default};
  border: 1px solid ${props => (!props.isSubmitted ? theme.colors.border : theme.colors.border)};
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }

  .note-timestamp {
    position: absolute;
    bottom: 0;
    left: 0;
    margin: 0.75rem;
    font-size: 0.75rem;
    color: ${theme.colors.textLight};
    font-style: italic;
  }

  .edit-buttons {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    display: flex;
    gap: 0.5rem;
  }

  .note-content {
    width: 100%;
    flex-grow: 1;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    overflow-y: auto;
    max-width: 100%;
    margin-bottom: 1.5rem;
    padding-right: 1.5rem;
  }

  textarea {
    width: 100%;
    border: none;
    resize: none;
    overflow: hidden;
    font-size: 1rem;
    line-height: 1.5;
    padding: 0.5rem;
    margin: 0;
    height: auto;
    min-height: 0rem;
    background-color: ${theme.colors.background};
    border-radius: ${theme.borderRadius.md};
  }
`;

const Content = styled.div`
  flex-grow: 1;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  overflow-y: auto;
  max-width: 100%;
  margin-bottom: 1rem;
  padding-bottom: 0.25rem;
  font-size: 1rem;
  line-height: 1.5;
  color: ${theme.colors.text};
`;

const SaveButton = styled(Button)`
  padding: 6px 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${theme.colors.success};
  
  &:hover {
    background-color: ${theme.colors.success};
    opacity: 0.9;
  }
`;

const CancelButton = styled(Button)`
  padding: 6px 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${theme.colors.textLight};
  
  &:hover {
    background-color: ${theme.colors.textLight};
    opacity: 0.9;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: ${theme.colors.textLight};
  font-size: 1rem;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.full};
  transition: ${theme.transitions.default};
  
  &:hover {
    background-color: ${theme.colors.danger};
    color: white;
  }
`;

const EditButton = styled(Button)`
  position: absolute;
  padding: 6px 12px;
  bottom: 0.75rem;
  right: 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OfflineIndicatorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  position: relative;
  bottom: 0;
  right: 0;
  font-size: 0.75rem;
  color: #fff;
  margin-top: 6px;
`;

const OfflineIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 0.25rem;
  background-color: rgba(239, 68, 68, 0.1);
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.md};
`;

const OfflineIndicatorIcon = styled(FontAwesomeIcon)`
  color: ${theme.colors.danger};
  margin-right: 0.25rem;
  font-size: 0.75rem;
`;

const OfflineIndicatorText = styled.span`
  font-size: 0.75rem;
  color: ${theme.colors.danger};
  font-weight: 500;
`;

interface NoteItemProps {
  note: Note,
  onDeleteNote: (noteId: string) => Promise<void>;
  onEditNote: (noteId: string, updatedTitle: string, updatedTags?: string[]) => Promise<void>;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDeleteNote, onEditNote }) => {
  const [isSyncing, setSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDelete = async () => {
    // Set syncing state to true before making the request
    setSyncing(true);

    try {
      // Make the delete request to the server
      if (note.localId !== undefined) {
        await onDeleteNote(note.localId);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      // Set syncing state back to false after the request is complete
      setSyncing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTitle(note.title);
  };

  const handleSave = async () => {
    if (note.localId !== undefined) {
      setSyncing(true);
      await onEditNote(note.localId, title, tags);
      setSyncing(false);
      setIsEditing(false);
    }
  };

  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === 'Enter' || event.key === ',') && tagInput.trim() !== '') {
      event.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  const handleCancel = () => {
    setIsEditing(false);
    setTitle(note.title);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.value = note.title;
    }
  }, [isEditing, title]);

  // Update local state if note changes (e.g., after save)
  useEffect(() => {
    setTags(note.tags || []);
  }, [note.tags]);

  return (
    <NoteItemWrapper>
      <NoteFrame isSubmitted={note._id !== undefined}>
        {isSyncing && <SyncIndicator/>}
        <DeleteButton onClick={handleDelete}>
          <FontAwesomeIcon icon={faTimes} />
        </DeleteButton>
        <p className="note-timestamp">{new Date(note.createdAt).toLocaleString()}</p>
        <div className="note-content">
          {isEditing ? (
            <>
              <TextArea
                as="textarea"
                ref={textareaRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: theme.colors.textLight }}>Tags</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add tag and press Enter"
                    style={{ 
                      flex: 1, 
                      padding: '8px 12px', 
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.md,
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {tags.map(tag => (
                      <Tag key={tag}>
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)} 
                          style={{ 
                            marginLeft: '6px', 
                            background: 'transparent', 
                            border: 'none', 
                            cursor: 'pointer', 
                            color: 'inherit',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '16px',
                            height: '16px',
                            padding: 0,
                            borderRadius: '50%'
                          }}
                        >
                          ×
                        </button>
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Content>{note.title}</Content>
              {/* Show tags as chips */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {isEditing ? (
          <div className="edit-buttons">
            <SaveButton onClick={handleSave}>
              <FontAwesomeIcon icon={faSave} />
              Save
            </SaveButton>
            <CancelButton onClick={handleCancel}>
              <FontAwesomeIcon icon={faCancel} />
              Cancel
            </CancelButton>
          </div>
        ) : (
          <EditButton onClick={handleEdit}>
            <FontAwesomeIcon icon={faEdit} />
            Edit
          </EditButton>
        )}
      </NoteFrame>
      {(note.localDeleteSynced === false || note.localEditSynced === false || note._id === undefined) && (
        <OfflineIndicatorWrapper>
          {note.localDeleteSynced === false && (
            <OfflineIndicator>
              <OfflineIndicatorIcon icon={faExclamationCircle} />
              <OfflineIndicatorText>Note deletion not synced</OfflineIndicatorText>
            </OfflineIndicator>
          )}
          {note.localEditSynced === false && (
            <OfflineIndicator>
              <OfflineIndicatorIcon icon={faExclamationCircle} />
              <OfflineIndicatorText>Note edit not synced</OfflineIndicatorText>
            </OfflineIndicator>
          )}
          {note._id === undefined && (
            <OfflineIndicator>
              <OfflineIndicatorIcon icon={faExclamationCircle} />
              <OfflineIndicatorText>Note submission not synced</OfflineIndicatorText>
            </OfflineIndicator>
          )}
        </OfflineIndicatorWrapper>
      )}
    </NoteItemWrapper>
  );
};

export default NoteItem;