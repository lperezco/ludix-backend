import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserTypesService } from './user-types.service';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';

@Controller('user-types')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserTypesController {
  constructor(private readonly userTypesService: UserTypesService) {}

  /**
   * Obtener todos los tipos de usuario
   * GET /user-types
   */
  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.userTypesService.findAll();
  }

  /**
   * Obtener un tipo de usuario por ID
   * GET /user-types/:id
   */
  @Get(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userTypesService.findById(id);
  }

  /**
   * Crear un nuevo tipo de usuario
   * POST /user-types
   */
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserTypeDto: CreateUserTypeDto) {
    return this.userTypesService.create(createUserTypeDto);
  }

  /**
   * Actualizar un tipo de usuario
   * PUT /user-types/:id
   */
  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserTypeDto: UpdateUserTypeDto,
  ) {
    return this.userTypesService.update(id, updateUserTypeDto);
  }

  /**
   * Eliminar un tipo de usuario
   * DELETE /user-types/:id
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userTypesService.remove(id);
  }
}