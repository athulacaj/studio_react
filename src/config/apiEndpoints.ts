import { GetProjectsParams, SelectedAlbumsParams, SharedLinksParams } from "../types/apiEndPointTypes"



function makeQueryUrl(obj: Record<string, any>) {
    return Object.keys(obj).map((key: string) => `${key}=${obj[key as keyof typeof obj]}`).join('&')
}
const ApiEndPoints = {
    projects: {
        get: {
            projects: (params: GetProjectsParams) => `/projects/projects?` + makeQueryUrl(params),
            selectedAlbums: (params: SelectedAlbumsParams) => `/projects/selected-albums?` + makeQueryUrl(params),
            sharedLinks: (params: SharedLinksParams) => `/projects/sharedLinks?` + makeQueryUrl(params),
        },
        post: {
            projects: () => `/projects/projects`,
            selectedAlbums: () => `/projects/selected-albums`,
            sharedLinks: () => `/projects/sharedLinks`,
        },
        put: {
            sharedLinks: (id: string) => `/projects/sharedLinks/${id}`,
        }
    },
    google: {
        post: {
            folderStructure: () => `/google/folder-structure`,
            uploadDriveData: () => `/google/upload-drive-data`,
        }
    }

}
export default ApiEndPoints 
