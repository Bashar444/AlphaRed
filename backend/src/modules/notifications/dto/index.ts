import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
    @ApiProperty()
    @IsString()
    userId!: string;

    @ApiProperty()
    @IsString()
    type!: string;

    @ApiProperty()
    @IsString()
    title!: string;

    @ApiProperty()
    @IsString()
    message!: string;

    @ApiPropertyOptional()
    @IsOptional()
    data?: any;
}

export class NotificationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    unreadOnly?: boolean;
}
