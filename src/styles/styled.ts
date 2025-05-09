import styled from 'styled-components';
import theme from './theme';

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: ${theme.fonts.sans};
  color: ${theme.colors.text};
  background-color: ${theme.colors.background};
  min-height: 100vh;
`;

export const Heading = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 24px;
  text-align: center;
  position: relative;
  padding-bottom: 12px;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: ${theme.colors.primary};
    border-radius: ${theme.borderRadius.full};
  }
`;

export const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.sm};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${theme.colors.secondary};
    box-shadow: ${theme.shadows.md};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${theme.shadows.sm};
  }
`;

export const Card = styled.div`
  background-color: ${theme.colors.card};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: 24px;
  transition: ${theme.transitions.default};
  border: 1px solid ${theme.colors.border};
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
  }
`;

export const Tag = styled.span`
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  padding: 4px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0 4px 4px 0;
  display: inline-flex;
  align-items: center;
  transition: ${theme.transitions.default};
  
  &:hover {
    background-color: ${theme.colors.primary};
    color: white;
    border-color: ${theme.colors.primary};
  }
`;

export const Input = styled.input`
  padding: 10px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  width: 100%;
  transition: ${theme.transitions.default};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
  
  &::placeholder {
    color: ${theme.colors.textLight};
  }
`;

export const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  width: 100%;
  transition: ${theme.transitions.default};
  resize: vertical;
  min-height: 100px;
  font-family: ${theme.fonts.sans};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
  
  &::placeholder {
    color: ${theme.colors.textLight};
  }
`;