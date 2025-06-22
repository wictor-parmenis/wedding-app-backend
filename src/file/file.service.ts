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
      async uploadFile(
        file: UploadedFile,
        options?: {
            weddingId?: number;
            userId?: number;
            paymentId?: number;
            fileType?: 'payment-proof' | 'other';
        }
    ): Promise<FileUploadResponse> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        
        const allowedMimetypes = Object.values(AllowedFileType) as string[];
        if (!allowedMimetypes.includes(file.mimetype)) {
            throw new BadRequestException('Only PDF, PNG and JPG/JPEG files are allowed');
        }

        if (file.size > FILE_SIZE_LIMIT) {
            throw new BadRequestException('File size exceeds 5MB limit');
        }

        let key: string;
        const timestamp = Date.now();
        const extension = file.originalname.split('.').pop() || 'unknown';

        if (options?.fileType === 'payment-proof' && options.weddingId && options.userId && options.paymentId) {
            // Estrutura organizada para comprovantes de pagamento
            key = `weddings/${options.weddingId}/payments/${options.userId}/${options.paymentId}-${timestamp}.${extension}`;
        } else {
            // Fallback para outros tipos de upload
            key = `uploads/other/${timestamp}-${file.originalname}`;
        }
        
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
