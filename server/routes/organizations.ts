import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertOrganizationSchema, insertOrganizationMemberSchema, insertTeamSchema, insertTeamMemberSchema } from '../../shared/schema';

const router = Router();

// ===== Organization Routes =====
router.get('/api/organizations', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organizations = await storage.getUserOrganizations(req.user!.id);
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

router.get('/api/organizations/:id', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organization = await storage.getOrganization(parseInt(req.params.id));
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user can access this organization
    const isMember = await storage.isOrganizationMember(organization.id, req.user!.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to view this organization' });
    }
    
    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

router.post('/api/organizations', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const validatedData = insertOrganizationSchema.parse(req.body);
    
    // Set the current user as the owner
    validatedData.owner_id = req.user!.id;
    
    const organization = await storage.createOrganization(validatedData);
    res.status(201).json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

router.patch('/api/organizations/:id', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organizationId = parseInt(req.params.id);
    
    // Check if user can update this organization
    const canManage = await storage.canManageOrganization(organizationId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to update this organization' });
    }
    
    const organization = await storage.updateOrganization(organizationId, req.body);
    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

router.delete('/api/organizations/:id', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organizationId = parseInt(req.params.id);
    
    // Only owner can delete organization
    const isOwner = await storage.isOrganizationOwner(organizationId, req.user!.id);
    if (!isOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this organization' });
    }
    
    await storage.deleteOrganization(organizationId);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// ===== Organization Member Routes =====
router.get('/api/organizations/:id/members', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organizationId = parseInt(req.params.id);
    
    // Check if user can view organization members
    const isMember = await storage.isOrganizationMember(organizationId, req.user!.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to view organization members' });
    }
    
    const members = await storage.getOrganizationMembers(organizationId);
    res.json(members);
  } catch (error) {
    console.error('Error fetching organization members:', error);
    res.status(500).json({ error: 'Failed to fetch organization members' });
  }
});

router.post('/api/organizations/:id/members', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organizationId = parseInt(req.params.id);
    
    // Check if user can manage organization
    const canManage = await storage.canManageOrganization(organizationId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to add members to this organization' });
    }
    
    const validatedData = insertOrganizationMemberSchema.parse({
      ...req.body,
      organization_id: organizationId
    });
    
    // Check if user already exists in organization
    const isMember = await storage.isOrganizationMember(organizationId, validatedData.user_id);
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member of this organization' });
    }
    
    const member = await storage.addOrganizationMember(validatedData);
    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding organization member:', error);
    res.status(500).json({ error: 'Failed to add organization member' });
  }
});

router.patch('/api/organizations/:orgId/members/:userId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organizationId = parseInt(req.params.orgId);
    const userId = parseInt(req.params.userId);
    
    // Check if user can manage organization
    const canManage = await storage.canManageOrganization(organizationId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to update members in this organization' });
    }
    
    // Check if trying to update organization owner's role
    const org = await storage.getOrganization(organizationId);
    if (org && org.owner_id === userId) {
      return res.status(400).json({ error: 'Cannot modify the role of the organization owner' });
    }
    
    const member = await storage.updateOrganizationMember(organizationId, userId, req.body);
    res.json(member);
  } catch (error) {
    console.error('Error updating organization member:', error);
    res.status(500).json({ error: 'Failed to update organization member' });
  }
});

router.delete('/api/organizations/:orgId/members/:userId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organizationId = parseInt(req.params.orgId);
    const userId = parseInt(req.params.userId);
    
    // Check if user can manage organization
    const canManage = await storage.canManageOrganization(organizationId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to remove members from this organization' });
    }
    
    // Check if trying to remove organization owner
    const org = await storage.getOrganization(organizationId);
    if (org && org.owner_id === userId) {
      return res.status(400).json({ error: 'Cannot remove the organization owner' });
    }
    
    await storage.removeOrganizationMember(organizationId, userId);
    res.status(204).end();
  } catch (error) {
    console.error('Error removing organization member:', error);
    res.status(500).json({ error: 'Failed to remove organization member' });
  }
});

// ===== Team Routes =====
router.get('/api/organizations/:id/teams', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organizationId = parseInt(req.params.id);
    
    // Check if user can view organization teams
    const isMember = await storage.isOrganizationMember(organizationId, req.user!.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to view teams in this organization' });
    }
    
    const teams = await storage.getOrganizationTeams(organizationId);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

router.post('/api/organizations/:id/teams', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const organizationId = parseInt(req.params.id);
    
    // Check if user can manage organization
    const canManage = await storage.canManageOrganization(organizationId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to create teams in this organization' });
    }
    
    const validatedData = insertTeamSchema.parse({
      ...req.body,
      organization_id: organizationId
    });
    
    // By default, make the current user the team lead
    if (!validatedData.lead_id) {
      validatedData.lead_id = req.user!.id;
    }
    
    const team = await storage.createTeam(validatedData);
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

router.get('/api/teams/:id', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const teamId = parseInt(req.params.id);
    
    const team = await storage.getTeam(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user can access this team
    const canAccess = await storage.canAccessTeam(teamId, req.user!.id);
    if (!canAccess) {
      return res.status(403).json({ error: 'Not authorized to view this team' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

router.patch('/api/teams/:id', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const teamId = parseInt(req.params.id);
    
    // Check if user can manage this team
    const canManage = await storage.canManageTeam(teamId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to update this team' });
    }
    
    const team = await storage.updateTeam(teamId, req.body);
    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

router.delete('/api/teams/:id', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const teamId = parseInt(req.params.id);
    
    // Check if user can manage this team
    const canManage = await storage.canManageTeam(teamId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to delete this team' });
    }
    
    await storage.deleteTeam(teamId);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// ===== Team Member Routes =====
router.get('/api/teams/:id/members', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const teamId = parseInt(req.params.id);
    
    // Check if user can access this team
    const canAccess = await storage.canAccessTeam(teamId, req.user!.id);
    if (!canAccess) {
      return res.status(403).json({ error: 'Not authorized to view members of this team' });
    }
    
    const members = await storage.getTeamMembers(teamId);
    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

router.post('/api/teams/:id/members', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const teamId = parseInt(req.params.id);
    
    // Check if user can manage this team
    const canManage = await storage.canManageTeam(teamId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to add members to this team' });
    }
    
    const validatedData = insertTeamMemberSchema.parse({
      ...req.body,
      team_id: teamId
    });
    
    // Check if the user is already a member of the team
    const isTeamMember = await storage.isTeamMember(teamId, validatedData.user_id);
    if (isTeamMember) {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }
    
    // Check if the user is a member of the organization
    const team = await storage.getTeam(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const isOrgMember = await storage.isOrganizationMember(team.organization_id, validatedData.user_id);
    if (!isOrgMember) {
      return res.status(400).json({ error: 'User must be a member of the organization before being added to a team' });
    }
    
    const member = await storage.addTeamMember(validatedData);
    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

router.patch('/api/teams/:teamId/members/:userId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const teamId = parseInt(req.params.teamId);
    const userId = parseInt(req.params.userId);
    
    // Check if user can manage this team
    const canManage = await storage.canManageTeam(teamId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to update members in this team' });
    }
    
    // Check if trying to update team lead's role
    const team = await storage.getTeam(teamId);
    if (team && team.lead_id === userId) {
      return res.status(400).json({ error: 'Cannot modify the role of the team lead' });
    }
    
    const member = await storage.updateTeamMember(teamId, userId, req.body);
    res.json(member);
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

router.delete('/api/teams/:teamId/members/:userId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const teamId = parseInt(req.params.teamId);
    const userId = parseInt(req.params.userId);
    
    // Check if user can manage this team
    const canManage = await storage.canManageTeam(teamId, req.user!.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to remove members from this team' });
    }
    
    // Check if trying to remove team lead
    const team = await storage.getTeam(teamId);
    if (team && team.lead_id === userId) {
      return res.status(400).json({ error: 'Cannot remove the team lead' });
    }
    
    await storage.removeTeamMember(teamId, userId);
    res.status(204).end();
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

export default router;