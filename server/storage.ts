import { 
  User, InsertUser, RFQ, InsertRFQ, Bid, InsertBid, Contract, InsertContract, 
  Message, InsertMessage, Transaction, InsertTransaction, Supplier,
  Organization, InsertOrganization, Team, InsertTeam,
  OrganizationMember, InsertOrganizationMember, TeamMember, InsertTeamMember,
  ResourcePermission, InsertResourcePermission
} from '@shared/schema';
import { 
  users, rfqs, bids, contracts, messages, transactions, suppliers,
  organizations, teams, organizationMembers, teamMembers, resourcePermissions
} from '@shared/schema';
import { db } from './db';
import { eq, and, or, desc } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { pool } from './db';

const PostgresSessionStore = connectPg(session);

// Define a type for creating a supplier
export interface InsertSupplier {
  user_id: number;
  industry: string;
  product_categories: string[];
  risk_score?: number;
  verification_status?: boolean;
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletBalance(id: number, balance: number): Promise<User | undefined>;
  
  // Supplier operations
  getSupplierByUserId(userId: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier | undefined>;
  
  // RFQ operations
  getAllRFQs(): Promise<RFQ[]>;
  getUserRFQs(userId: number): Promise<RFQ[]>;
  getRFQ(id: number): Promise<RFQ | undefined>;
  createRFQ(rfq: InsertRFQ): Promise<RFQ>;
  updateRFQ(id: number, data: Partial<RFQ>): Promise<RFQ | undefined>;
  
  // Bid operations
  getAllBids(): Promise<Bid[]>;
  getBids(rfqId?: number, supplierId?: number): Promise<Bid[]>;
  getUserBids(userId: number): Promise<Bid[]>;
  getBid(id: number): Promise<Bid | undefined>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBidStatus(id: number, status: string): Promise<Bid | undefined>;
  
  // Contract operations
  getUserContracts(userId: number): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContractStatus(id: number, status: string): Promise<Contract | undefined>;
  
  // Message operations
  getUserMessages(userId: number, otherUserId?: number, rfqId?: number, bidId?: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message | undefined>;
  
  // Transaction operations
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Organization operations
  getOrganization(id: number): Promise<Organization | undefined>;
  getUserOrganizations(userId: number): Promise<Organization[]>;
  createOrganization(data: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, data: Partial<InsertOrganization>): Promise<Organization>;
  deleteOrganization(id: number): Promise<void>;
  isOrganizationMember(organizationId: number, userId: number): Promise<boolean>;
  isOrganizationOwner(organizationId: number, userId: number): Promise<boolean>;
  canManageOrganization(organizationId: number, userId: number): Promise<boolean>;
  getOrganizationMembers(organizationId: number): Promise<OrganizationMember[]>;
  addOrganizationMember(data: InsertOrganizationMember): Promise<OrganizationMember>;
  updateOrganizationMember(organizationId: number, userId: number, data: Partial<InsertOrganizationMember>): Promise<OrganizationMember>;
  removeOrganizationMember(organizationId: number, userId: number): Promise<void>;
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getOrganizationTeams(organizationId: number): Promise<Team[]>;
  getUserTeams(userId: number): Promise<Team[]>;
  createTeam(data: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
  isTeamMember(teamId: number, userId: number): Promise<boolean>;
  canAccessTeam(teamId: number, userId: number): Promise<boolean>;
  canManageTeam(teamId: number, userId: number): Promise<boolean>;
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  addTeamMember(data: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(teamId: number, userId: number, data: Partial<InsertTeamMember>): Promise<TeamMember>;
  removeTeamMember(teamId: number, userId: number): Promise<void>;
  
  // Permission operations
  getResourcePermission(id: number): Promise<ResourcePermission | undefined>;
  getResourcePermissions(resourceType: string, resourceId: number): Promise<ResourcePermission[]>;
  getSpecificResourcePermission(resourceType: string, resourceId: number, userId?: number, teamId?: number, organizationId?: number): Promise<ResourcePermission | undefined>;
  createResourcePermission(data: InsertResourcePermission): Promise<ResourcePermission>;
  updateResourcePermission(id: number, data: Partial<InsertResourcePermission>): Promise<ResourcePermission>;
  deleteResourcePermission(id: number): Promise<void>;
  canViewResourcePermissions(resourceType: string, resourceId: number, userId: number): Promise<boolean>;
  canManageResourcePermissions(resourceType: string, resourceId: number, userId: number): Promise<boolean>;
  getUserPermissionLevel(resourceType: string, resourceId: number, userId: number): Promise<string>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUserWalletBalance(id: number, balance: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ wallet_balance: balance })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Supplier operations
  async getSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.user_id, userId));
    return supplier;
  }
  
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }
  
  async updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ risk_score: riskScore })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }
  
  // RFQ operations
  async getAllRFQs(): Promise<RFQ[]> {
    return await db.select().from(rfqs).orderBy(desc(rfqs.created_at));
  }
  
  async getUserRFQs(userId: number): Promise<RFQ[]> {
    return await db
      .select()
      .from(rfqs)
      .where(eq(rfqs.user_id, userId))
      .orderBy(desc(rfqs.created_at));
  }
  
  async getRFQ(id: number): Promise<RFQ | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    return rfq;
  }
  
  async createRFQ(rfq: InsertRFQ): Promise<RFQ> {
    const [newRfq] = await db.insert(rfqs).values(rfq).returning();
    return newRfq;
  }
  
  async updateRFQ(id: number, data: Partial<RFQ>): Promise<RFQ | undefined> {
    const [updatedRfq] = await db
      .update(rfqs)
      .set(data)
      .where(eq(rfqs.id, id))
      .returning();
    return updatedRfq;
  }
  
  // Bid operations
  async getAllBids(): Promise<Bid[]> {
    return await db.select().from(bids).orderBy(desc(bids.created_at));
  }
  
  async getBids(rfqId?: number, supplierId?: number): Promise<Bid[]> {
    let query = db.select().from(bids);
    
    if (rfqId && supplierId) {
      query = query.where(and(eq(bids.rfq_id, rfqId), eq(bids.supplier_id, supplierId)));
    } else if (rfqId) {
      query = query.where(eq(bids.rfq_id, rfqId));
    } else if (supplierId) {
      query = query.where(eq(bids.supplier_id, supplierId));
    }
    
    return await query.orderBy(desc(bids.created_at));
  }
  
  async getUserBids(userId: number): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.supplier_id, userId))
      .orderBy(desc(bids.created_at));
  }
  
  async getBid(id: number): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid;
  }
  
  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }
  
  async updateBidStatus(id: number, status: string): Promise<Bid | undefined> {
    const [updatedBid] = await db
      .update(bids)
      .set({ status: status as any, updated_at: new Date() })
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }
  
  // Contract operations
  async getUserContracts(userId: number): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(or(eq(contracts.buyer_id, userId), eq(contracts.supplier_id, userId)))
      .orderBy(desc(contracts.created_at));
  }
  
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }
  
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }
  
  async updateContractStatus(id: number, status: string): Promise<Contract | undefined> {
    const [updatedContract] = await db
      .update(contracts)
      .set({ status: status as any, updated_at: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract;
  }
  
  // Message operations
  async getUserMessages(userId: number, otherUserId?: number, rfqId?: number, bidId?: number): Promise<Message[]> {
    let query = db.select().from(messages).where(
      or(
        eq(messages.sender_id, userId),
        eq(messages.recipient_id, userId)
      )
    );
    
    if (otherUserId) {
      query = query.where(
        or(
          and(
            eq(messages.sender_id, userId),
            eq(messages.recipient_id, otherUserId)
          ),
          and(
            eq(messages.sender_id, otherUserId),
            eq(messages.recipient_id, userId)
          )
        )
      );
    }
    
    if (rfqId) {
      query = query.where(eq(messages.rfq_id, rfqId));
    }
    
    if (bidId) {
      query = query.where(eq(messages.bid_id, bidId));
    }
    
    return await query.orderBy(desc(messages.created_at));
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  
  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ status: status as any })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }
  
  // Transaction operations
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.created_at));
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }

  async getUserOrganizations(userId: number): Promise<Organization[]> {
    // Get organizations where user is owner or member
    const ownedOrgs = await db
      .select()
      .from(organizations)
      .where(eq(organizations.owner_id, userId));
    
    const membershipOrgs = await db
      .select({
        organization: organizations
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organization_id, organizations.id))
      .where(eq(organizationMembers.user_id, userId));
    
    // Combine results, removing duplicates
    const memberOrgObjs = membershipOrgs.map(row => row.organization);
    const ownedOrgIds = new Set(ownedOrgs.map(org => org.id));
    const uniqueMemberOrgs = memberOrgObjs.filter(org => !ownedOrgIds.has(org.id));
    
    return [...ownedOrgs, ...uniqueMemberOrgs];
  }

  async createOrganization(data: InsertOrganization): Promise<Organization> {
    const [organization] = await db.insert(organizations).values({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }).returning();
    
    return organization;
  }

  async updateOrganization(id: number, data: Partial<InsertOrganization>): Promise<Organization> {
    const [organization] = await db
      .update(organizations)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(organizations.id, id))
      .returning();
    
    return organization;
  }

  async deleteOrganization(id: number): Promise<void> {
    // Delete all teams first
    const orgTeams = await this.getOrganizationTeams(id);
    for (const team of orgTeams) {
      await this.deleteTeam(team.id);
    }
    
    // Delete all memberships
    await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.organization_id, id));
    
    // Delete all resource permissions
    await db
      .delete(resourcePermissions)
      .where(eq(resourcePermissions.organization_id, id));
    
    // Delete organization
    await db
      .delete(organizations)
      .where(eq(organizations.id, id));
  }

  async isOrganizationMember(organizationId: number, userId: number): Promise<boolean> {
    // Check if user is owner
    const org = await this.getOrganization(organizationId);
    if (org && org.owner_id === userId) {
      return true;
    }
    
    // Check if user is member
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organization_id, organizationId),
        eq(organizationMembers.user_id, userId)
      ));
    
    return !!membership;
  }

  async isOrganizationOwner(organizationId: number, userId: number): Promise<boolean> {
    const org = await this.getOrganization(organizationId);
    return !!org && org.owner_id === userId;
  }

  async canManageOrganization(organizationId: number, userId: number): Promise<boolean> {
    // Owner can always manage
    const isOwner = await this.isOrganizationOwner(organizationId, userId);
    if (isOwner) {
      return true;
    }
    
    // Check if user is admin or manager
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organization_id, organizationId),
        eq(organizationMembers.user_id, userId),
        or(
          eq(organizationMembers.role, 'admin'),
          eq(organizationMembers.role, 'manager')
        )
      ));
    
    return !!membership;
  }

  async getOrganizationMembers(organizationId: number): Promise<OrganizationMember[]> {
    return await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organization_id, organizationId));
  }

  async addOrganizationMember(data: InsertOrganizationMember): Promise<OrganizationMember> {
    const [member] = await db
      .insert(organizationMembers)
      .values({
        ...data,
        joined_at: new Date()
      })
      .returning();
    
    return member;
  }

  async updateOrganizationMember(organizationId: number, userId: number, data: Partial<InsertOrganizationMember>): Promise<OrganizationMember> {
    const [member] = await db
      .update(organizationMembers)
      .set(data)
      .where(and(
        eq(organizationMembers.organization_id, organizationId),
        eq(organizationMembers.user_id, userId)
      ))
      .returning();
    
    return member;
  }

  async removeOrganizationMember(organizationId: number, userId: number): Promise<void> {
    // Remove user from all teams in the organization
    const orgTeams = await this.getOrganizationTeams(organizationId);
    for (const team of orgTeams) {
      const isMember = await this.isTeamMember(team.id, userId);
      if (isMember) {
        await this.removeTeamMember(team.id, userId);
      }
    }
    
    // Remove user from organization
    await db
      .delete(organizationMembers)
      .where(and(
        eq(organizationMembers.organization_id, organizationId),
        eq(organizationMembers.user_id, userId)
      ));
  }

  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getOrganizationTeams(organizationId: number): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.organization_id, organizationId));
  }

  async getUserTeams(userId: number): Promise<Team[]> {
    // Get teams where user is a member
    const memberTeams = await db
      .select({
        team: teams
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.team_id, teams.id))
      .where(eq(teamMembers.user_id, userId));
    
    return memberTeams.map(row => row.team);
  }

  async createTeam(data: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    return team;
  }

  async updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team> {
    const [team] = await db
      .update(teams)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(teams.id, id))
      .returning();
    
    return team;
  }

  async deleteTeam(id: number): Promise<void> {
    // Delete all team memberships
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.team_id, id));
    
    // Delete all resource permissions
    await db
      .delete(resourcePermissions)
      .where(eq(resourcePermissions.team_id, id));
    
    // Delete team
    await db
      .delete(teams)
      .where(eq(teams.id, id));
  }

  async isTeamMember(teamId: number, userId: number): Promise<boolean> {
    // Check if user is team lead
    const team = await this.getTeam(teamId);
    if (team && team.lead_id === userId) {
      return true;
    }
    
    // Check if user is member
    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.team_id, teamId),
        eq(teamMembers.user_id, userId)
      ));
    
    return !!membership;
  }

  async canAccessTeam(teamId: number, userId: number): Promise<boolean> {
    // Check if user is team member
    const isTeamMember = await this.isTeamMember(teamId, userId);
    if (isTeamMember) {
      return true;
    }
    
    // Check if user is organization admin or owner
    const team = await this.getTeam(teamId);
    if (team) {
      const isOwner = await this.isOrganizationOwner(team.organization_id, userId);
      if (isOwner) {
        return true;
      }
      
      const canManage = await this.canManageOrganization(team.organization_id, userId);
      if (canManage) {
        return true;
      }
    }
    
    return false;
  }

  async canManageTeam(teamId: number, userId: number): Promise<boolean> {
    // Check if user is team lead
    const team = await this.getTeam(teamId);
    if (team && team.lead_id === userId) {
      return true;
    }
    
    // Check if user is team admin
    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.team_id, teamId),
        eq(teamMembers.user_id, userId),
        or(
          eq(teamMembers.role, 'admin'),
          eq(teamMembers.role, 'manager')
        )
      ));
    
    if (membership) {
      return true;
    }
    
    // Check if user is organization admin or owner
    if (team) {
      const isOwner = await this.isOrganizationOwner(team.organization_id, userId);
      if (isOwner) {
        return true;
      }
      
      const [orgMembership] = await db
        .select()
        .from(organizationMembers)
        .where(and(
          eq(organizationMembers.organization_id, team.organization_id),
          eq(organizationMembers.user_id, userId),
          eq(organizationMembers.role, 'admin')
        ));
      
      return !!orgMembership;
    }
    
    return false;
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.team_id, teamId));
  }

  async addTeamMember(data: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db
      .insert(teamMembers)
      .values({
        ...data,
        joined_at: new Date()
      })
      .returning();
    
    return member;
  }

  async updateTeamMember(teamId: number, userId: number, data: Partial<InsertTeamMember>): Promise<TeamMember> {
    const [member] = await db
      .update(teamMembers)
      .set(data)
      .where(and(
        eq(teamMembers.team_id, teamId),
        eq(teamMembers.user_id, userId)
      ))
      .returning();
    
    return member;
  }

  async removeTeamMember(teamId: number, userId: number): Promise<void> {
    await db
      .delete(teamMembers)
      .where(and(
        eq(teamMembers.team_id, teamId),
        eq(teamMembers.user_id, userId)
      ));
  }

  // Permission operations
  async getResourcePermission(id: number): Promise<ResourcePermission | undefined> {
    const [permission] = await db
      .select()
      .from(resourcePermissions)
      .where(eq(resourcePermissions.id, id));
    
    return permission;
  }

  async getResourcePermissions(resourceType: string, resourceId: number): Promise<ResourcePermission[]> {
    return await db
      .select()
      .from(resourcePermissions)
      .where(and(
        eq(resourcePermissions.resource_type, resourceType),
        eq(resourcePermissions.resource_id, resourceId)
      ));
  }

  async getSpecificResourcePermission(
    resourceType: string,
    resourceId: number,
    userId?: number,
    teamId?: number,
    organizationId?: number
  ): Promise<ResourcePermission | undefined> {
    let query = db
      .select()
      .from(resourcePermissions)
      .where(and(
        eq(resourcePermissions.resource_type, resourceType),
        eq(resourcePermissions.resource_id, resourceId)
      ));
    
    if (userId) {
      query = query.where(eq(resourcePermissions.user_id, userId));
    }
    
    if (teamId) {
      query = query.where(eq(resourcePermissions.team_id, teamId));
    }
    
    if (organizationId) {
      query = query.where(eq(resourcePermissions.organization_id, organizationId));
    }
    
    const [permission] = await query;
    return permission;
  }

  async createResourcePermission(data: InsertResourcePermission): Promise<ResourcePermission> {
    const [permission] = await db
      .insert(resourcePermissions)
      .values({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    return permission;
  }

  async updateResourcePermission(id: number, data: Partial<InsertResourcePermission>): Promise<ResourcePermission> {
    const [permission] = await db
      .update(resourcePermissions)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(resourcePermissions.id, id))
      .returning();
    
    return permission;
  }

  async deleteResourcePermission(id: number): Promise<void> {
    await db
      .delete(resourcePermissions)
      .where(eq(resourcePermissions.id, id));
  }

  async canViewResourcePermissions(resourceType: string, resourceId: number, userId: number): Promise<boolean> {
    // Resource owner can always view permissions
    const canManage = await this.canManageResourcePermissions(resourceType, resourceId, userId);
    return canManage;
  }

  async canManageResourcePermissions(resourceType: string, resourceId: number, userId: number): Promise<boolean> {
    // Check if the user is directly the creator of the resource
    if (resourceType === 'rfq') {
      const rfq = await this.getRFQ(resourceId);
      if (rfq && rfq.user_id === userId) {
        return true;
      }
    } else if (resourceType === 'team') {
      const team = await this.getTeam(resourceId);
      if (team) {
        // Team lead can manage permissions
        if (team.lead_id === userId) {
          return true;
        }
        
        // Organization owner can manage team permissions
        const isOrgOwner = await this.isOrganizationOwner(team.organization_id, userId);
        if (isOrgOwner) {
          return true;
        }
      }
    } else if (resourceType === 'organization') {
      const isOrgOwner = await this.isOrganizationOwner(resourceId, userId);
      if (isOrgOwner) {
        return true;
      }
      
      const canManage = await this.canManageOrganization(resourceId, userId);
      if (canManage) {
        return true;
      }
    }
    
    // Check if the user has a direct 'full' permission
    const userPermission = await this.getSpecificResourcePermission(resourceType, resourceId, userId);
    if (userPermission && userPermission.permission === 'full') {
      return true;
    }
    
    // Check team permissions
    const userTeams = await this.getUserTeams(userId);
    for (const team of userTeams) {
      const teamPermission = await this.getSpecificResourcePermission(resourceType, resourceId, undefined, team.id);
      if (teamPermission && teamPermission.permission === 'full') {
        return true;
      }
    }
    
    // Check organization permissions
    const userOrgs = await this.getUserOrganizations(userId);
    for (const org of userOrgs) {
      const orgPermission = await this.getSpecificResourcePermission(resourceType, resourceId, undefined, undefined, org.id);
      if (orgPermission && orgPermission.permission === 'full') {
        return true;
      }
    }
    
    return false;
  }

  async getUserPermissionLevel(resourceType: string, resourceId: number, userId: number): Promise<string> {
    // Check if user can manage the resource
    const canManage = await this.canManageResourcePermissions(resourceType, resourceId, userId);
    if (canManage) {
      return 'full';
    }
    
    // Check for direct user permission
    const userPermission = await this.getSpecificResourcePermission(resourceType, resourceId, userId);
    if (userPermission) {
      return userPermission.permission;
    }
    
    // Check team permissions
    const userTeams = await this.getUserTeams(userId);
    let highestTeamPermission = 'none';
    
    for (const team of userTeams) {
      const teamPermission = await this.getSpecificResourcePermission(resourceType, resourceId, undefined, team.id);
      if (teamPermission) {
        if (teamPermission.permission === 'full') {
          return 'full';
        }
        
        // Store highest permission level
        if (
          (teamPermission.permission === 'create' && highestTeamPermission === 'read') ||
          (teamPermission.permission === 'update' && ['read', 'create'].includes(highestTeamPermission)) ||
          (teamPermission.permission === 'delete' && ['read', 'create', 'update'].includes(highestTeamPermission))
        ) {
          highestTeamPermission = teamPermission.permission;
        }
      }
    }
    
    if (highestTeamPermission !== 'none') {
      return highestTeamPermission;
    }
    
    // Check organization permissions
    const userOrgs = await this.getUserOrganizations(userId);
    let highestOrgPermission = 'none';
    
    for (const org of userOrgs) {
      const orgPermission = await this.getSpecificResourcePermission(resourceType, resourceId, undefined, undefined, org.id);
      if (orgPermission) {
        if (orgPermission.permission === 'full') {
          return 'full';
        }
        
        // Store highest permission level
        if (
          (orgPermission.permission === 'create' && highestOrgPermission === 'read') ||
          (orgPermission.permission === 'update' && ['read', 'create'].includes(highestOrgPermission)) ||
          (orgPermission.permission === 'delete' && ['read', 'create', 'update'].includes(highestOrgPermission))
        ) {
          highestOrgPermission = orgPermission.permission;
        }
      }
    }
    
    if (highestOrgPermission !== 'none') {
      return highestOrgPermission;
    }
    
    // Default: no permission
    return 'none';
  }
}

export const storage = new DatabaseStorage();