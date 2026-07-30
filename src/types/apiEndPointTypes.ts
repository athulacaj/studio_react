interface GetProjectsParams {
    userId?: string;
    updatedAfter?: string;
    projectId?: string;
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

export type { GetProjectsParams, SelectedAlbumsParams, SharedLinksParams };