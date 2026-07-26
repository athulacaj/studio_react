import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const cloudflareS3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
});


// async function test() {
//     try {
//         await cloudflareS3Client.send(
//             new PutObjectCommand({
//                 Bucket: "studio",
//                 Key: "test.txt",
//                 Body: "hello",
//             })
//         );
//     } catch (e) {
//         console.log(e)
//     }
// }

export const cloudflareBucket =
    process.env.CLOUDFLARE_R2_BUCKET_NAME!;