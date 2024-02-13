import { IsString } from 'class-validator';

class idIsString {
  @IsString()
  id: string;
}

export default idIsString;
