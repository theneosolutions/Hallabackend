
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { CommonService } from '../common/common.service';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { Packages } from './entities/packages.entity';
import { UpdatePackageDto } from './dtos/update-package.dto';
import { isInt } from 'class-validator';
import { PackagesDto } from './dtos/create-packages.dto';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { PageMetaDto } from './dtos/page-meta.dto';

@Injectable()
export class PackagesService {
    constructor(
        @InjectRepository(Packages)
        private readonly packageRepository: Repository<Packages>,
        private readonly commonService: CommonService,
    ) { }

    public async create(origin: string | undefined, dto: PackagesDto): Promise<Packages> {
        const { name, subHeading, price,numberOfGuest, notes, description } = dto;

        if (isNaN(price) || isNull(price) || isUndefined(price)) {
            throw new BadRequestException('Price cannot be null');
        }

        if (isNaN(numberOfGuest) || isNull(numberOfGuest) || isUndefined(numberOfGuest)) {
            throw new BadRequestException('Number Of Guest cannot be null');
        }

        if (isNull(name) || isUndefined(name)) {
            throw new BadRequestException('name cannot be empty');
        }

        const packageItem = this.packageRepository.create({
            name: name,
            subHeading: subHeading,
            price: price,
            numberOfGuest:numberOfGuest,
            notes: notes,
            description: description,
        });
        await this.packageRepository.insert(packageItem);
        return packageItem;
    }


    public async findOneById(
        id: string,
    ): Promise<Packages> {
        const parsedValue = parseInt(id, 10);

        if (isNaN(parsedValue) && !isInt(parsedValue)) {
            throw new BadRequestException('Invalid package id: ' + parsedValue);

        }

        const packageInfo = await this.packageRepository.findOneBy({ id: parsedValue });
        return packageInfo;

    }

    public async findOneByName(
        name: string,
    ): Promise<Packages[]> {
        const packageInfo = await this.packageRepository.find({ where: { name: name }, withDeleted: true });
        return packageInfo;

    }

    public async getPackages(
        pageOptionsDto: PageOptionsDto
    ): Promise<PageDto<PackagesDto>> {
        console.log('pageOptionsDto', pageOptionsDto);

        const queryBuilder = this.packageRepository.createQueryBuilder("packages");

        queryBuilder
            .where("packages.name like :search OR" +
                " packages.subHeading like :search OR" +
                " packages.notes like :search OR" +
                " packages.description like :search OR" +
                " packages.price like :search",
                { search: `%${pageOptionsDto.search}%` })
            .orderBy("packages.createdAt", pageOptionsDto.order)
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take);

        const itemCount = await queryBuilder.getCount();
        const { entities } = await queryBuilder.getRawAndEntities();

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(entities, pageMetaDto);
    }

    public async updatePackageByID(id: string, dto: UpdatePackageDto): Promise<Packages> {

        const { name, subHeading, price,numberOfGuest, notes, description, status } = dto;

        const parsedValue = parseInt(id, 10);
        if (isNaN(parsedValue) && !isInt(parsedValue)) {
            throw new BadRequestException('Invalid package id: ' + parsedValue);
        }

        const packageInfo = await this.packageRepository.findOneBy({ id: parsedValue });
        if (!packageInfo) {
            throw new BadRequestException('Package with id ' + parsedValue + ' does not exist');
        }

        if (!isUndefined(name) && !isNull(name)) {
            packageInfo.name = name;
        }

        if (!isUndefined(subHeading) && !isNull(subHeading)) {
            packageInfo.subHeading = subHeading;
        }

        if (!isUndefined(price) && !isNull(price)) {
            packageInfo.price = price;
        }

        if (!isUndefined(numberOfGuest) && !isNull(numberOfGuest)) {
            packageInfo.numberOfGuest = numberOfGuest;
        }

        if (!isUndefined(notes) && !isNull(notes)) {
            packageInfo.notes = notes;
        }

        if (!isUndefined(description) && !isNull(description)) {
            packageInfo.description = description;
        }

        if (!isUndefined(status) && !isNull(status)) {
            packageInfo.status = status;
        }

        const updateResponse = await this.packageRepository.update(packageInfo.id, packageInfo);
        if (!updateResponse.affected) {
            throw new BadRequestException('Error while deleting package. Please try again');
        }

        return packageInfo;


    }


    public async findPackageByIdAndDelete(id: string): Promise<Packages> {
        const parsedValue = parseInt(id, 10);
        if (isNaN(parsedValue) && !isInt(parsedValue)) {
            throw new BadRequestException('Invalid package id: ' + parsedValue);
        }

        const packageInfo = await this.packageRepository.findOneBy({ id: parsedValue });
        if (!packageInfo) {
            throw new BadRequestException('Package with id ' + parsedValue + ' does not exist');
        }

        const deleteResponse = await this.packageRepository.softDelete(packageInfo.id);
        if (!deleteResponse.affected) {
            throw new BadRequestException('Error while deleting package. Please try again');
        }

        return packageInfo;


    }

    public async findOneByWhere(
        where: any,
    ): Promise<Packages[]> {

        const packagesItems = await this.packageRepository.findBy(where)
        return packagesItems;
    }


}
