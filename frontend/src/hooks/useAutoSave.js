import { useEffect, useRef, useState } from 'react';
import { saveDraft, getDrafts } from '../utils/api';
import { toast } from 'react-toastify';

export const useAutoSave = (data, options = {}) => {
  const {
    delay = 3000, // Auto-save delay in milliseconds
    storyId = null,
    type = 'story',
    enabled = true,
    onSave = null,
    onRestore = null
  } = options;

  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const timeoutRef = useRef();
  const lastDataRef = useRef();
  const isInitialLoadRef = useRef(true);

  // Local storage key for client-side backup
  const getLocalStorageKey = () => {
    return storyId ? `draft_story_${storyId}` : `draft_new_story`;
  };

  // Save to localStorage as immediate backup
  const saveToLocalStorage = (dataToSave) => {
    try {
      const storageData = {
        ...dataToSave,
        lastSaved: new Date().toISOString(),
        timestamp: Date.now()
      };
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(storageData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(getLocalStorageKey());
      if (stored) {
        const parsedData = JSON.parse(stored);
        // Only restore if data is less than 24 hours old
        const dataAge = Date.now() - parsedData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (dataAge < maxAge) {
          return parsedData;
        } else {
          // Clean up old data
          localStorage.removeItem(getLocalStorageKey());
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  };

  // Check for existing drafts on mount
  useEffect(() => {
    if (!enabled) return;

    const checkForExistingDraft = async () => {
      try {
        // First check localStorage for immediate data
        const localData = loadFromLocalStorage();
        
        // Then check server for saved drafts
        const drafts = await getDrafts(type, storyId);
        const latestDraft = drafts.length > 0 ? drafts[0] : null;

        // Determine which data is newer
        let dataToRestore = null;
        
        if (localData && latestDraft) {
          const localTime = new Date(localData.lastSaved).getTime();
          const serverTime = new Date(latestDraft.lastSaved).getTime();
          dataToRestore = localTime > serverTime ? localData : latestDraft;
        } else {
          dataToRestore = localData || latestDraft;
        }

        if (dataToRestore && onRestore) {
          // Check if the current data is significantly different from stored data
          const hasSignificantChanges = !isInitialLoadRef.current || 
            JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
            
          if (hasSignificantChanges) {
            const shouldRestore = window.confirm(
              'We found an unsaved draft from your previous session. Would you like to restore it?'
            );
            
            if (shouldRestore) {
              onRestore(dataToRestore);
              setLastSaved(new Date(dataToRestore.lastSaved));
              toast.success('Draft restored successfully!');
            }
          }
        }
      } catch (error) {
        console.error('Error checking for existing draft:', error);
      }
      
      isInitialLoadRef.current = false;
    };

    checkForExistingDraft();
  }, [enabled, type, storyId]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || isInitialLoadRef.current) return;

    // Check if data has actually changed
    const currentDataString = JSON.stringify(data);
    const lastDataString = JSON.stringify(lastDataRef.current);
    
    if (currentDataString === lastDataString) {
      return; // No changes, skip auto-save
    }

    lastDataRef.current = data;
    setHasUnsavedChanges(true);
    setAutoSaveStatus('saving');

    // Save to localStorage immediately for instant backup
    saveToLocalStorage(data);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for server save
    timeoutRef.current = setTimeout(async () => {
      try {
        const draftData = {
          ...data,
          storyId,
          type
        };

        await saveDraft(draftData);
        
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        
        if (onSave) {
          onSave();
        }
      } catch (error) {
        console.error('Auto-save error:', error);
        setAutoSaveStatus('error');
        toast.error('Failed to auto-save. Your work is backed up locally.');
      }
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, storyId, type, onSave]);

  // Manual save function
  const saveNow = async () => {
    if (!enabled) return;

    setAutoSaveStatus('saving');
    
    try {
      const draftData = {
        ...data,
        storyId,
        type
      };

      await saveDraft(draftData);
      
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Also update localStorage
      saveToLocalStorage(data);
      
      if (onSave) {
        onSave();
      }
      
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Manual save error:', error);
      setAutoSaveStatus('error');
      toast.error('Failed to save draft');
      throw error;
    }
  };

  // Clear draft function (call when story is published)
  const clearDraft = () => {
    try {
      localStorage.removeItem(getLocalStorageKey());
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    autoSaveStatus,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
    clearDraft
  };
};