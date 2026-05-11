import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpStatus 
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

interface PostgresError {
  code: string;
  detail?: string;
}

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const err = (exception.driverError as unknown) as PostgresError;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor en la base de datos';
    if (err.code === '23503') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Operación rechazada: Uno de los identificadores proporcionados (ej. trainingId) no existe en el sistema.';
    }
    else if (err.code === '23505') {
      status = HttpStatus.CONFLICT;
      message = 'Operación rechazada: Ya existe un registro con esos datos únicos.';
    }
    response.status(status).json({
      statusCode: status,
      message: message,
      error: 'Database Error',
    });
  }
}