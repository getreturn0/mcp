import { IsString, IsArray, ValidateNested, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class VariableDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  lineNumber!: number;
}

export class FileDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariableDto)
  variables!: VariableDto[];
}

export class RetrieveVariableValuesActionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  files!: FileDto[];
}
