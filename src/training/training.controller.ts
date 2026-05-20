import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TrainingCardResponseDto } from './dto/training-card-response.dto';
import { TrainingDetailResponseDto } from './dto/training-detail-response.dto';
import { Training } from './entities/training.entity';

@Controller('trainings')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  @ApiResponse({ status: 200, type: [TrainingCardResponseDto] })
  getAllTraining(): Promise<TrainingCardResponseDto[]> {
    return this.trainingService.getAllTraining();
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: TrainingDetailResponseDto })
  getTrainingById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TrainingDetailResponseDto> {
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
  @ApiResponse({ status: 201, type: Training })
  createTraining(
    @UploadedFile() file: Express.Multer.File,
    @Body() dataTraining: CreateTrainingDto,
  ): Promise<Training> {
    return this.trainingService.createTraining(dataTraining, file);
  }

  @Post('seeder')
  @ApiResponse({ status: 201, type: [Training] })
  seedTraining(): Promise<Training[]> {
    return this.trainingService.addTraining();
  }

  @Patch(':id')
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
  @ApiResponse({ status: 200, type: Training })
  @UseInterceptors(FileInterceptor('file'))
  updateTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dataTraining: UpdateTrainingDto,
  ): Promise<Training | null> {
    return this.trainingService.updateTraining(id, dataTraining);
  }

  @Delete(':id')
  @ApiBearerAuth('Bearer')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiResponse({ status: 200 })
  deleteTraining(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.trainingService.deleteTraining(id);
  }
}
