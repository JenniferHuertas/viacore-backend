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
        title: { type: 'string', example: 'Capacitación NestJS' },
        description: { type: 'string', example: 'Curso básico de NestJS' },
        category: { type: 'string', example: 'Backend' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'description', 'category', 'file'],
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
