interface GetProjectsParams {
    userId: string | null;
    updatedAfter?: string;
    projectId: string | null;
}

interface SelectedAlbumsParams {
    sharedLinkId?: string;
    updatedAfter?: string;
}

interface SharedLinksParams {
    id?: string;
    sourceProjectId?: string;
    createdBy?: string;
    updatedAfter?: string;
}

interface GetWebsitesParams {
    projectId?: string;
    businessId?: number;
}

export type { GetProjectsParams, SelectedAlbumsParams, SharedLinksParams, GetWebsitesParams };