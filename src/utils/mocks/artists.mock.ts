import { CreateArtistDto } from 'src/artists/dto/create-artist.dto';
import { Artist } from 'src/artists/entities/artist.entity';
import { Genre } from 'src/genres/entities/genre.entity';

export const genreCreatedEntityMock: Genre = {
  name: 'Ogre Music',
};
export const genreSavedEntityMock: Genre = {
  name: 'Ogre Music',
  id: 'f0fafa21-82d9-4153-9621-cdcfb944484b',
};

export const artistCreatedEntityMock: Artist = {
  name: 'The Ogre Magixx',
  genres: [
    {
      id: 'f0fafa21-82d9-4153-9621-cdcfb944484b',
      name: 'Ogre Music',
    },
  ],
};

export const artistSavedEntityMock: Artist = {
  name: 'The Ogre Magixx',
  id: '0e944457-8613-4737-b275-be11a0da6127',
  genres: [
    {
      id: 'f0fafa21-82d9-4153-9621-cdcfb944484b',
      name: 'Ogre Music',
    },
  ],
};

export const artistDtoMock: CreateArtistDto = {
  name: 'The Ogre Magixx',
  genres: ['Ogre Music'],
};

export const artistSavedWithoutGenresMock: Artist = {
  name: 'The Sound of Nothing',
  genres: [],
};

export const artistCreatedWithoutGenresMock: Artist = {
  name: 'The Sound of Nothing',
  id: '0e944457-8613-4737-b275-be11a0da6667',
  genres: [],
};
