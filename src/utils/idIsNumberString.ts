import { IsUUID } from 'class-validator';

class idIsUUID {
  @IsUUID()
  id: string;
}

export default idIsUUID;
