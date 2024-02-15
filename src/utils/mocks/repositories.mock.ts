import { artistSavedEntityMock, genreSavedEntityMock } from './artists.mock';

export const artistRepositoryMock = {
  create: jest.fn().mockResolvedValue(artistSavedEntityMock),
  save: jest.fn().mockReturnValue(artistSavedEntityMock),
};

export const genreRepositoryMock = {
  create: jest.fn().mockResolvedValue(genreSavedEntityMock),
  save: jest.fn().mockReturnValue(genreSavedEntityMock),
  findOne: jest.fn().mockReturnValue(null),
};
