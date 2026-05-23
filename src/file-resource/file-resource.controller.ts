import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { FileResourceService } from './file-resource.service';
import { UploadFileDto } from './dto/upload-file.dto';

@ApiTags('Files')
@Controller('files')
export class FileResourceController {
  constructor(private readonly fileService: FileResourceService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
        },
        trainingId: {
          type: 'string',
          format: 'uuid',
        },
        trainingRequestId: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    return this.fileService.upload(file, dto);
  }
}
