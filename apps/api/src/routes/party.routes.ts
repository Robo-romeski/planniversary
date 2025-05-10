import { Router } from 'express';
import { sendInvitations } from '../controllers/party.controller';

const router = Router();

// POST /api/party/:id/invite
router.post('/:id/invite', sendInvitations);

export default router; 