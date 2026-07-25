
import CloudflareRepository from "../repositories/CloudfareRepository";

export default class CloudflareService {
    constructor(
        private readonly repository: CloudflareRepository
    ) { }

    async uploadFile(
        key: string,
        body: Buffer | Uint8Array | Blob | string,
        contentType?: string
    ) {
        await this.repository.uploadData(
            key,
            body,
            contentType
        );

        return {
            success: true,
            key,
        };
    }

    async createUploadUrl(
        folder: string,
        fileName: string,
        contentType?: string
    ) {
        const key = `${folder}/${Date.now()}-${fileName}`;

        const url = await this.repository.getSignedUploadUrl(
            key,
            3600,
            contentType
        );

        return {
            key,
            uploadUrl: url,
        };
    }

    async createMultipleUploadUrls(
        folder: string,
        files: { fileName: string; contentType?: string }[]
    ) {
        return Promise.all(
            files.map((file) =>
                this.createUploadUrl(folder, file.fileName, file.contentType)
            )
        );
    }
}