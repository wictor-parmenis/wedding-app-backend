import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileUploadResponse } from './interfaces/file.interface';
import { UploadedFile as IUploadedFile } from './interfaces/uploaded-file.interface';

@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: IUploadedFile): Promise<FileUploadResponse> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }
        return await this.fileService.uploadPDF(file);
    }
}
