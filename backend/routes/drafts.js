import express from 'express';
import {
  saveDraft,
  getDrafts,
  getDraft,
  deleteDraft,
  deactivateDraft,
  cleanupDrafts
} from '../controllers/draftController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All draft routes require authentication
router.use(auth);

// Save/update draft
router.post('/save', saveDraft);

// Get user's drafts
router.get('/', getDrafts);

// Get specific draft
router.get('/:draftId', getDraft);

// Delete draft
router.delete('/:draftId', deleteDraft);

// Deactivate drafts for a story (when published)
router.patch('/deactivate/:storyId', deactivateDraft);

// Cleanup old inactive drafts
router.delete('/cleanup', cleanupDrafts);

export default router;