import { BaseApiClient } from "./base-client";
import type {
  CreateChamaRequest,
  UpdateChamaRequest,
  FindChamaRequest,
  FilterChamasRequest,
  PaginatedFilterChamasResponse,
  JoinChamaRequest,
  InviteMembersRequest,
  GetMemberProfilesRequest,
  MemberProfilesResponse,
  Chama,
} from "../types/chama";
import type { ApiResponse } from "../types/lib";

export class ChamaApiClient extends BaseApiClient {
  /**
   * Create a new chama
   */
  async createChama(request: CreateChamaRequest): Promise<ApiResponse<Chama>> {
    return this.post<Chama>("/chamas", request);
  }

  /**
   * Update an existing chama
   */
  async updateChama(request: UpdateChamaRequest): Promise<ApiResponse<Chama>> {
    return this.put<Chama>(`/chamas/${request.chamaId}`, request.updates);
  }

  /**
   * Get a specific chama by ID
   */
  async getChama(request: FindChamaRequest): Promise<ApiResponse<Chama>> {
    return this.get<Chama>(`/chamas/${request.chamaId}`);
  }

  /**
   * Filter chamas with pagination
   */
  async filterChamas(
    request: FilterChamasRequest,
  ): Promise<ApiResponse<PaginatedFilterChamasResponse>> {
    const params: Record<string, string | number> = {};

    if (request.createdBy) {
      params.createdBy = request.createdBy;
    }

    if (request.memberId) {
      params.memberId = request.memberId;
    }

    if (request.pagination) {
      params.page = request.pagination.page;
      params.size = request.pagination.size;
    }

    return this.get<PaginatedFilterChamasResponse>("/chamas", params);
  }

  /**
   * Join a chama
   */
  async joinChama(request: JoinChamaRequest): Promise<ApiResponse<void>> {
    return this.post<void>(
      `/chamas/${request.chamaId}/join`,
      request.memberInfo,
    );
  }

  /**
   * Invite members to a chama
   */
  async inviteMembers(
    request: InviteMembersRequest,
  ): Promise<ApiResponse<void>> {
    return this.post<void>(`/chamas/${request.chamaId}/invite`, {
      invites: request.invites,
    });
  }

  /**
   * Get member profiles for a chama
   */
  async getMemberProfiles(
    request: GetMemberProfilesRequest,
  ): Promise<ApiResponse<MemberProfilesResponse>> {
    return this.get<MemberProfilesResponse>(
      `/chamas/${request.chamaId}/members`,
    );
  }

  /**
   * Leave a chama
   */
  async leaveChama(chamaId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/chamas/${chamaId}/leave`);
  }

  /**
   * Remove a member from a chama (admin only)
   */
  async removeMember(
    chamaId: string,
    userId: string,
  ): Promise<ApiResponse<void>> {
    return this.delete<void>(`/chamas/${chamaId}/members/${userId}`);
  }
}
