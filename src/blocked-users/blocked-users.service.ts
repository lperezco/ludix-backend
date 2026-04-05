import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between } from 'typeorm';
import { BlockedUser } from './entities/blocked-user.entity';
import { CreateBlockedUserDto } from './dto/create-blocked-user.dto';
import { UpdateBlockedUserDto } from './dto/update-blocked-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BlockedUsersService {
  constructor(
    @InjectRepository(BlockedUser)
    private blockedUserRepository: Repository<BlockedUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Bloquear un usuario
   */
  async create(
    createBlockedUserDto: CreateBlockedUserDto,
  ): Promise<BlockedUser> {
    const {
      userId,
      blockedBy,
      reason,
      blockedAt,
      isActive = true,
    } = createBlockedUserDto;

    // Verificar que el usuario a bloquear existe
    const userToBlock = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!userToBlock) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar que el usuario que bloquea existe
    const blocker = await this.userRepository.findOne({
      where: { id: blockedBy },
    });
    if (!blocker) {
      throw new NotFoundException(`Usuario con ID ${blockedBy} no encontrado`);
    }

    // No permitir bloquearse a sí mismo
    if (userId === blockedBy) {
      throw new BadRequestException('No puedes bloquearte a ti mismo');
    }

    // Verificar si ya existe un bloqueo activo para este usuario
    const existingBlock = await this.blockedUserRepository.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (existingBlock) {
      throw new ConflictException(
        `El usuario ${userId} ya está bloqueado. Estado: ${existingBlock.isActive ? 'Activo' : 'Inactivo'}`,
      );
    }

    // Crear el bloqueo
    const blockedUser = this.blockedUserRepository.create({
      userId,
      blockedBy,
      reason,
      blockedAt,
      isActive,
    });

    return await this.blockedUserRepository.save(blockedUser);
  }

  /**
   * Obtener todos los bloqueos (con paginación y filtros)
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
    userId?: number,
    blockedBy?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    data: BlockedUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (userId) {
      where.userId = userId;
    }

    if (blockedBy) {
      where.blockedBy = blockedBy;
    }

    if (startDate && endDate) {
      where.blockedAt = Between(startDate, endDate);
    } else if (startDate) {
      where.blockedAt = MoreThan(startDate);
    } else if (endDate) {
      where.blockedAt = LessThan(endDate);
    }

    const [data, total] = await this.blockedUserRepository.findAndCount({
      where,
      relations: ['user', 'blockedByUser'],
      order: { blockedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un bloqueo por ID
   */
  async findById(id: number): Promise<BlockedUser> {
    const blockedUser = await this.blockedUserRepository.findOne({
      where: { id },
      relations: ['user', 'blockedByUser'],
    });

    if (!blockedUser) {
      throw new NotFoundException(`Bloqueo con ID ${id} no encontrado`);
    }

    return blockedUser;
  }

  /**
   * Obtener bloqueos de un usuario
   */
  async findByUser(
    userId: number,
    isActive?: boolean,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return this.findAll(page, limit, isActive, userId);
  }

  /**
   * Obtener bloqueos realizados por un usuario
   */
  async findByBlocker(
    blockedBy: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const blocker = await this.userRepository.findOne({
      where: { id: blockedBy },
    });
    if (!blocker) {
      throw new NotFoundException(`Usuario con ID ${blockedBy} no encontrado`);
    }

    return this.findAll(page, limit, undefined, undefined, blockedBy);
  }

  /**
   * Verificar si un usuario está bloqueado
   */
  async isUserBlocked(userId: number): Promise<boolean> {
    const blocked = await this.blockedUserRepository.findOne({
      where: {
        userId,
        isActive: true,
      },
    });
    return !!blocked;
  }

  /**
   * Obtener usuario bloqueado activo
   */
  async getActiveBlock(userId: number): Promise<BlockedUser | null> {
    return await this.blockedUserRepository.findOne({
      where: {
        userId,
        isActive: true,
      },
      relations: ['user', 'blockedByUser'],
    });
  }

  /**
   * Desbloquear un usuario (soft deactivate)
   */
  async unblock(userId: number): Promise<{ message: string }> {
    const blockedUser = await this.getActiveBlock(userId);

    if (!blockedUser) {
      throw new NotFoundException(
        `El usuario ${userId} no está bloqueado actualmente`,
      );
    }

    // Actualizar estado a inactivo
    await this.blockedUserRepository.update(blockedUser.id, {
      isActive: false,
    });

    return {
      message: `Usuario ${userId} desbloqueado correctamente`,
    };
  }

  /**
   * Actualizar un bloqueo
   */
  async update(
    id: number,
    updateBlockedUserDto: UpdateBlockedUserDto,
  ): Promise<BlockedUser> {
    const blockedUser = await this.findById(id);

    // Si se actualiza el userId, verificar que existe
    if (
      updateBlockedUserDto.userId &&
      updateBlockedUserDto.userId !== blockedUser.userId
    ) {
      const user = await this.userRepository.findOne({
        where: { id: updateBlockedUserDto.userId },
      });
      if (!user) {
        throw new NotFoundException(
          `Usuario con ID ${updateBlockedUserDto.userId} no encontrado`,
        );
      }
    }

    // Si se actualiza el blockedBy, verificar que existe
    if (
      updateBlockedUserDto.blockedBy &&
      updateBlockedUserDto.blockedBy !== blockedUser.blockedBy
    ) {
      const blocker = await this.userRepository.findOne({
        where: { id: updateBlockedUserDto.blockedBy },
      });
      if (!blocker) {
        throw new NotFoundException(
          `Usuario con ID ${updateBlockedUserDto.blockedBy} no encontrado`,
        );
      }
    }

    // No permitir bloquearse a sí mismo si se cambian los IDs
    const newUserId = updateBlockedUserDto.userId || blockedUser.userId;
    const newBlockedBy =
      updateBlockedUserDto.blockedBy || blockedUser.blockedBy;
    if (newUserId === newBlockedBy) {
      throw new BadRequestException(
        'No puedes bloquear a un usuario si eres el mismo',
      );
    }

    await this.blockedUserRepository.update(id, updateBlockedUserDto);

    return this.findById(id);
  }

  /**
   * Eliminar un bloqueo (hard delete)
   */
  async remove(id: number): Promise<{ message: string }> {
    const blockedUser = await this.findById(id);

    const result = await this.blockedUserRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Bloqueo con ID ${id} no encontrado`);
    }

    return {
      message: `Bloqueo de usuario ${blockedUser.user?.name || blockedUser.userId} eliminado correctamente`,
    };
  }

  /**
   * Obtener estadísticas de bloqueos
   */
  async getStats(): Promise<any> {
    const total = await this.blockedUserRepository.count();
    const active = await this.blockedUserRepository.count({
      where: { isActive: true },
    });
    const inactive = total - active;

    // Usuarios más bloqueados
    const mostBlockedUsers = await this.blockedUserRepository
      .createQueryBuilder('blocked')
      .leftJoinAndSelect('blocked.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.name', 'userName')
      .addSelect('COUNT(blocked.id)', 'blockCount')
      .groupBy('user.id')
      .addGroupBy('user.name')
      .orderBy('blockCount', 'DESC')
      .limit(5)
      .getRawMany();

    // Usuarios que más bloquean
    const mostActiveBlockers = await this.blockedUserRepository
      .createQueryBuilder('blocked')
      .leftJoinAndSelect('blocked.blockedByUser', 'blocker')
      .select('blocker.id', 'blockerId')
      .addSelect('blocker.name', 'blockerName')
      .addSelect('COUNT(blocked.id)', 'blockCount')
      .groupBy('blocker.id')
      .addGroupBy('blocker.name')
      .orderBy('blockCount', 'DESC')
      .limit(5)
      .getRawMany();

    // Bloqueos por día (últimos 30 días)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const byDay = await this.blockedUserRepository
      .createQueryBuilder('blocked')
      .select('DATE(blocked.blockedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('blocked.blockedAt > :last30Days', { last30Days })
      .groupBy('DATE(blocked.blockedAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      mostBlockedUsers,
      mostActiveBlockers,
      last30Days: byDay,
    };
  }

  /**
   * Obtener bloqueos activos con expiración (ej: bloqueos de más de 30 días)
   */
  async getExpiredBlocks(days: number = 30): Promise<BlockedUser[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - days);

    return await this.blockedUserRepository.find({
      where: {
        isActive: true,
        blockedAt: LessThan(expiryDate),
      },
      relations: ['user', 'blockedByUser'],
    });
  }

  /**
   * Expirar bloqueos antiguos (desactivarlos automáticamente)
   */
  async expireOldBlocks(
    days: number = 30,
  ): Promise<{ message: string; expiredCount: number }> {
    const expiredBlocks = await this.getExpiredBlocks(days);

    if (expiredBlocks.length === 0) {
      return { message: 'No hay bloqueos expirados', expiredCount: 0 };
    }

    const expiredIds = expiredBlocks.map((block) => block.id);
    await this.blockedUserRepository.update(expiredIds, { isActive: false });

    return {
      message: `${expiredBlocks.length} bloqueos expirados (mayores a ${days} días) desactivados`,
      expiredCount: expiredBlocks.length,
    };
  }
}
