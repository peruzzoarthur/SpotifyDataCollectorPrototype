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
  timestamp: '1708026472456',
  genres: [
    {
      id: 'f0fafa21-82d9-4153-9621-cdcfb944484b',
      name: 'Ogre Music',
    },
  ],
};

export const artistSavedEntityMock: Artist = {
  name: 'The Ogre Magixx',
  timestamp: '1708026472456',
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
  timestamp: '1708026472456',
  genres: [],
};

export const artistCreatedWithoutGenresMock: Artist = {
  name: 'The Sound of Nothing',
  timestamp: '1708026472456',
  id: '0e944457-8613-4737-b275-be11a0da6667',
  genres: [],
};

export const arrayOfArtists: Artist[] = [
  {
    id: '614b846e-e09c-4f07-95b0-28266e7a87df',
    name: 'Lithicus Ludicus',
    timestamp: '1708026472456',
    genres: [
      {
        id: 'ce9a79db-5fc5-422c-833f-d7f91efe5fb1',
        name: 'Opera Gira',
      },
    ],
  },
  {
    id: '032587ac-c470-421e-967e-3779970e406c',
    name: 'The Ogre Magixx',
    timestamp: '1708026472456',
    genres: [
      {
        id: 'f0fafa21-82d9-4153-9621-cdcfb944484b',
        name: 'Ogre Music',
      },
    ],
  },
  {
    id: '1796631a-5cbe-4e33-8b2e-e23987be1de7',
    name: 'Lizza Guizardooo',
    timestamp: '1708026472456',
    genres: [
      {
        id: '21697560-e991-4635-ab16-0b5572346bc6',
        name: 'New Era Metal',
      },
      {
        id: 'b4e7003a-21c1-4e9d-b66e-a3e65478380f',
        name: 'Metalist',
      },
    ],
  },
  {
    id: '0e944457-8613-4737-b275-be11a0da6127',
    name: 'The Sound of Nothing',
    timestamp: '1708026472456',
    genres: [],
  },
];
