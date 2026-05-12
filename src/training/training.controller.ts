import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('trainings')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  getAllTraining() {
    return this.trainingService.getAllTraining();
  }

  @Get(':id')
  getTrainingById(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.getTrainingById(id);
  }

  @Post()
  @ApiBearerAuth('Bearer')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Service Title Test 01' },
        shortDescription: {
          type: 'string',
          example: 'Service ShortDescription Test 01',
        },
        description: { type: 'string', example: 'Service Description Test 01' },
        tagline: { type: 'string', example: 'Service Tagline Test 01' },
        includes: {
          type: 'array',
          example: [
            'Service Include Test 01',
            'Service Include Test 02',
            'Service Include Test 03',
          ],
        },
        category: { type: 'string', example: 'Service Category Test 01' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'title',
        'shortDescription',
        'description',
        'tagline',
        'includes',
        'category',
        'file',
      ],
    },
  })
  createTraining(
    @UploadedFile() file: Express.Multer.File,
    @Body() dataTraining: CreateTrainingDto,
  ) {
    return this.trainingService.createTraining(dataTraining, file);
  }

  @Post('seeder')
  seedTraining() {
    return this.trainingService.addTraining();
  }

  @Put(':id')
  @ApiBearerAuth('Bearer')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Service Title Test 02' },
        shortDescription: {
          type: 'string',
          example: 'Service ShortDescription Test 02',
        },
        description: { type: 'string', example: 'Service Description Test 02' },
        tagline: { type: 'string', example: 'Service Tagline Test 02' },
        includes: {
          type: 'array',
          example: [
            'Service Include Test 04',
            'Service Include Test 05',
            'Service Include Test 06',
          ],
        },
        category: { type: 'string', example: 'Service Category Test 02' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  updateTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dataTraining: UpdateTrainingDto,
  ) {
    return this.trainingService.updateTraining(id, dataTraining);
  }

  @Delete(':id')
  @ApiBearerAuth('Bearer')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  deleteTraining(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.deleteTraining(id);
  }
}
