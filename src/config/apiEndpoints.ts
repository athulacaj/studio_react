
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
    projectId?: string;
    userId?: string;
    updatedAfter?: string;
}

function makeQueryUrl(obj: Record<string, any>) {
    return Object.keys(obj).map((key: string) => `${key}=${obj[key as keyof typeof obj]}`).join('&')
}
const ApiEndPoints = {
    projects: {
        get: {
            projects: (params: GetProjectsParams) => `/projects/projects?` + makeQueryUrl(params),
            selectedAlbums: (params: SelectedAlbumsParams) => `/projects/selected-albums?` + makeQueryUrl(params),
            sharedLinks: (params: SharedLinksParams) => `/projects/shared-links?` + makeQueryUrl(params),
        },
        post: {
            projects: () => `/projects/projects`,
            selectedAlbums: () => `/projects/selected-albums`,
            sharedLinks: () => `/projects/shared-links`,
        }
    }

}
export default ApiEndPoints;
