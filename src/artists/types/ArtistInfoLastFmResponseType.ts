type ImageInfo = {
  '#text': string;
  size: string;
};

export type ArtistInfoLastFmResponseType = {
  artist: {
    name: string;
    mbid: string;
    url: string;
    image: ImageInfo[];
    streamable: string;
    ontour: string;
    stats: {
      listeners: string;
      playcount: string;
    };
    similar: {
      artist: {
        name: string;
        url: string;
        image: ImageInfo[];
      }[];
    };
    tags: {
      tag: {
        name: string;
        url: string;
      }[];
    };
    bio: {
      links: {
        link: {
          '#text': string;
          rel: string;
          href: string;
        };
      };
      published: string;
      summary: string;
      content: string;
    };
  };
};
