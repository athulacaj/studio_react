import { GetProjectsParams, SelectedAlbumsParams, SharedLinksParams, GetWebsitesParams } from "../types/apiEndPointTypes"



function makeQueryUrl(obj: Record<string, any>) {
    return Object.keys(obj).map((key: string) => `${key}=${obj[key as keyof typeof obj]}`).join('&')
}
const ApiEndPoints = {
    projects: {
        get: {
            projects: (params: GetProjectsParams) => `/projects/projects?` + makeQueryUrl(params),
            selectedAlbums: (params: SelectedAlbumsParams) => `/projects/selected-albums?` + makeQueryUrl(params),
            sharedLinks: (params: SharedLinksParams) => `/projects/sharedLinks?` + makeQueryUrl(params),
            syncedFolders: (projectId: string) => `/projects/${projectId}/synced-folders`,
        },
        post: {
            projects: () => `/projects/projects`,
            selectedAlbums: () => `/projects/selected-albums`,
            sharedLinks: () => `/projects/sharedLinks`,
        },
        put: {
            sharedLinks: (id: string) => `/projects/sharedLinks/${id}`,
            selectedAlbums: () => `/projects/selected-albums`,
        }
    },
    google: {
        post: {
            folderStructure: () => `/google/folder-structure`,
            uploadDriveData: () => `/google/upload-drive-data`,
        }
    },
    business: {
        get: {
            byUserId: (userId: string) => `/business?userId=${userId}`,
            business: (id?: string) => `/business/${id ?? ''}`
        },
        post: {
            business: () => `/business`
        },
        put: {
            business: (id: string) => `/business/${id}`
        }
    },
    website: {
        get: {
            website: (params: GetWebsitesParams) => `/website?` + makeQueryUrl(params),
            path: (businessId: number) => `/website/path?businessId=${businessId}`
        },
        post: {
            "web": () => "/website",
            "website": () => "/website",
            "upload-urls": () => "/website/upload-urls",
            path: () => "/website/path"
        },
        put: {
            website: (id: number) => `/website/${id}`
        }
    }

}
export default ApiEndPoints 
