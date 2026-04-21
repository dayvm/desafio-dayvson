import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Request,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { type AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req: AuthenticatedRequest, file, cb) => {
          const userId = req.user.userId;
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);

          cb(null, `${userId}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Somente arquivos de imagem são permitidos!'), false);
        }

        cb(null, true);
      },
    }),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, req.user.userId, file);
  }

  @Get()
  findAll(@Query() query: ListProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('me')
  findMine(@Request() req: AuthenticatedRequest, @Query() query: ListProductsDto) {
    return this.productsService.findMine(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req: AuthenticatedRequest, file, cb) => {
          const userId = req.user.userId;
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);

          cb(null, `${userId}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Somente arquivos de imagem são permitidos!'), false);
        }

        cb(null, true);
      },
    }),
  )
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.userId, req.user.role, file);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: AuthenticatedRequest) {
    return this.productsService.remove(id, req.user.userId, req.user.role);
  }
}
