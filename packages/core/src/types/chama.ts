import type { PaginatedRequest } from "./lib";

export enum ChamaMemberRole {
  Member = 0,
  Admin = 1,
  ExternalAdmin = 3,
}

export interface Chama {
  id: string;
  name: string;
  description?: string;
  members: ChamaMember[];
  createdBy: string;
}

export interface ChamaMember {
  userId: string;
  roles: ChamaMemberRole[];
}

export interface ChamaInvite {
  phoneNumber?: string;
  nostrNpub?: string;
  roles: ChamaMemberRole[];
}

export interface CreateChamaRequest {
  name: string;
  description?: string;
  members: ChamaMember[];
  invites: ChamaInvite[];
  createdBy: string;
}

export interface UpdateChamaRequest {
  chamaId: string;
  updates: ChamaUpdates;
}

export interface ChamaUpdates {
  name?: string;
  description?: string;
  addMembers: ChamaMember[];
  updateMembers: ChamaMember[];
}

export interface FindChamaRequest {
  chamaId: string;
}

export interface FilterChamasRequest {
  createdBy?: string;
  memberId?: string;
  pagination?: PaginatedRequest;
}

export interface PaginatedFilterChamasResponse {
  chamas: Chama[];
  page: number;
  size: number;
  pages: number;
  total: number;
}

export interface JoinChamaRequest {
  chamaId: string;
  memberInfo: ChamaMember;
}

export interface InviteMembersRequest {
  chamaId: string;
  invites: ChamaInvite[];
}

export interface GetMemberProfilesRequest {
  chamaId: string;
}

export interface MemberProfile {
  userId: string;
  roles: ChamaMemberRole[];
  name?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  nostrNpub?: string;
}

export interface MemberProfilesResponse {
  members: MemberProfile[];
}
