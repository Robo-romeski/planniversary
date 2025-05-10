import { Request, Response } from 'express';
// import { sendPartyInvitations } from '../services/party.service'; // To be implemented

export async function sendInvitations(req: Request, res: Response) {
  const partyId = req.params.id;
  const { emails } = req.body;
  if (!partyId || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Party ID and emails are required' });
  }
  // Placeholder: will call sendPartyInvitations service
  return res.status(501).json({ error: 'Not implemented yet' });
} 