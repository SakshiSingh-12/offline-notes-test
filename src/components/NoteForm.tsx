import React, { useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { LoadingSpinner } from './LoadingSpinner'
import { Button, Card, TextArea, Input, Tag } from '../styles/styled';
import theme from '../styles/theme';

const NoteFormContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  align-self: center;
  width: 100%;
  margin-bottom: 24px;
  transition: ${theme.transitions.default};
  border: 1px solid ${theme.colors.border};
  
  &:focus-within {
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary};
  }
`;

const NoteInput = styled(TextArea)`
  margin-bottom: 16px;
  border: none;
  box-shadow: none;
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  padding: 16px;
  
  &:focus {
    box-shadow: none;
  }
`;

const AddNoteButton = styled(Button)`
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  align-self: flex-end;
  margin-top: 16px;
  min-width: 120px;
`;

const TagInput = styled(Input)`
  flex: 1;
  border: none;
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  
  &:focus {
    box-shadow: none;
  }
`;

interface NoteFormProps {
  onNoteSubmit: (noteTitle: string, tags: string[]) => Promise<void>;
}

const NoteForm: React.FC<NoteFormProps> = ({ onNoteSubmit }) => {
  const [isSyncing, setSyncing] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleNoteTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteTitle(event.target.value);
  };

  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (noteTitle.trim() === '') {
      return;
    }
    setSyncing(true)
    await onNoteSubmit(noteTitle, tags);
    setSyncing(false)
    setNoteTitle('');
    setTags([]);
    setTagInput('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <NoteFormContainer>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', color: theme.colors.primary }}>Create a new note</h2>
        <NoteInput
          rows={3}
          value={noteTitle}
          onChange={handleNoteTitleChange}
          placeholder="What's on your mind?"
        />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 500, color: theme.colors.textLight }}>Tags</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TagInput
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tag and press Enter"
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
        <AddNoteButton type="submit">
          {isSyncing ? <LoadingSpinner/> : "Add Note" }
        </AddNoteButton>
      </NoteFormContainer>
    </form>
  );
};

export default NoteForm;