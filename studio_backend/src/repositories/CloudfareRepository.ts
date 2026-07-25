import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default class CloudflareRepository {
    constructor(
        private readonly s3: S3Client,
        private readonly bucketName: string
    ) { }

    async uploadData(
        key: string,
        body: Buffer | Uint8Array | Blob | string,
        contentType?: string
    ): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await this.s3.send(command);
    }

    async getSignedUploadUrl(
        key: string,
        expiresIn = 3600,
        contentType?: string
    ): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        return getSignedUrl(this.s3, command, {
            expiresIn,
        });
    }
}