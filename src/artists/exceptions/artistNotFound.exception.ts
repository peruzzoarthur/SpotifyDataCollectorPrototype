import { NotFoundException } from '@nestjs/common';

export class ArtistNotFoundException extends NotFoundException {
  constructor(artistId: string) {
    super(`Artist with ID ${artistId} not found`);
  }
}
