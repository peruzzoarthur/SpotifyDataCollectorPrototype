import { IsNumberString } from 'class-validator';

class idIsNumberString {
  @IsNumberString()
  id: string;
}

export default idIsNumberString;
