import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AllowedFileType, FILE_SIZE_LIMIT } from './enums/file.enum';
import { FileUploadResponse } from './interfaces/file.interface';
import { UploadedFile } from './interfaces/uploaded-file.interface';

@Injectable()
export class FileService {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor() {
        this.bucketName = process.env.AWS_S3_BUCKET || '';
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }

    async uploadPDF(file: UploadedFile): Promise<FileUploadResponse> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        if (file.mimetype !== AllowedFileType.PDF) {
            throw new BadRequestException('Only PDF files are allowed');
        }

        if (file.size > FILE_SIZE_LIMIT) {
            throw new BadRequestException('File size exceeds 5MB limit');
        }

        const key = `uploads/${Date.now()}-${file.originalname}`;
        
        const uploadCommand = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await this.s3Client.send(uploadCommand);

        // Generate signed URL that expires in 1 hour
        const signedUrl = await getSignedUrl(
            this.s3Client,
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }),
            { expiresIn: 3600 }
        );

        return {
            key,
            url: signedUrl,
            fileName: file.originalname,
            contentType: file.mimetype,
            size: file.size,
        };
    }
}
