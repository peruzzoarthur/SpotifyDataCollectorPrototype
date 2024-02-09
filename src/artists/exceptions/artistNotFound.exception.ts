import { NotFoundException } from '@nestjs/common';

export class ArtistNotFoundException extends NotFoundException {
  constructor(artistId: number) {
    super(`Artist with ID ${artistId} not found`);
  }
}
