import {
  Album,
  Artist,
  AuthSession,
  Category,
  Playlist,
  Track,
  TrackAnalysis,
} from '@/types/types';
import { customGet } from '@/utils/serverUtils';
import { mkdir, writeFile } from 'fs/promises';
import {
  promises as fsPromises,
  constants as fsConstants,
  createWriteStream,
} from 'fs';
import axios from 'axios';
import { promisify } from 'util';
import * as stream from 'stream';

async function fileExists(path: string) {
  try {
    await fsPromises.access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}
export const getNewReleases = async (
  session: AuthSession
): Promise<Album[]> => {
  return customGet(
    'https://api.spotify.com/v1/browse/new-releases?country=IN&limit=15',
    session
  ).then((data) => data.albums.items);
};

export const getRecentlyPlayedTracks = async (
  session: AuthSession,
  limit = 50
) => {
  return customGet(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
    session
  );
};

export const getTopItems = async ({
  session,
  timeRange = 'short_term',
  limit = 50,
  type,
}: {
  session: AuthSession;
  timeRange?: string;
  limit?: number;
  type: 'artists' | 'tracks';
}) => {
  return customGet(
    `https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=${limit}`,
    session
  );
};

export const getAlbumById = async (
  session: AuthSession,
  albumId: string
): Promise<Album> => {
  return customGet(
    `https://api.spotify.com/v1/albums/${albumId}`,
    session
  );
};

export const getArtistById = async (
  session: AuthSession,
  artistId: string
): Promise<Artist> => {
  return customGet(
    `https://api.spotify.com/v1/artists/${artistId}`,
    session
  );
};

export const getArtistDiscography = async (
  session: AuthSession,
  artistId: string
) => {
  const baseUrl = `https://api.spotify.com/v1/artists/${artistId}`;

  const urls = [
    '',
    '/top-tracks?market=from_token',
    '/albums?include_groups=album',
    '/albums?include_groups=single',
    '/albums?include_groups=appears_on',
    '/albums?include_groups=compilation',
    '/related-artists',
  ];

  const promises = urls.map((url) =>
    customGet(`${baseUrl}${url}`, session)
  );
  return Promise.all(promises);
};

export const getCategoryById = async (
  session: AuthSession,
  categoryId: string
): Promise<Category> => {
  return customGet(
    `https://api.spotify.com/v1/browse/categories/${categoryId}`,
    session
  );
};

export const getPlaylistsByCategory = async (
  session: AuthSession,
  categoryId: string
): Promise<Playlist[]> => {
  const data = await customGet(
    `https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?country=IN&limit=50`,
    session
  );
  return data.playlists.items;
};

export const getUserLikedAlbums = async (
  session: AuthSession
): Promise<Album[]> => {
  const data = await customGet(
    `https://api.spotify.com/v1/me/albums?market=from_token&limit=50`,
    session
  );
  return data.items.map((item: any) => item.album);
};

export const getUserLikedArtists = async (
  session: AuthSession
): Promise<Artist[]> => {
  const data = await customGet(
    `https://api.spotify.com/v1/me/following?type=artist&limit=50`,
    session
  );
  return data.artists.items;
};

type LikedSongs = { total: number; items: Track[] };

export const getUserLikedSongs = async (
  session: AuthSession
): Promise<LikedSongs> => {
  const data = await customGet(
    `https://api.spotify.com/v1/me/tracks?limit=50`,
    session
  );

  const finalData = { total: data.total, items: data.items };
  let limit = 50;
  let currUrl = data.next;

  while (currUrl !== null) {
    const nextData = await customGet(currUrl, session);
    finalData.items.push(...nextData.items);
    limit += 50;
    currUrl = nextData.next;
  }

  return {
    total: data.total,
    items: data.items.map((item: any) => item.track),
  };
};

export const getUserLikedPlaylists = async (
  session: AuthSession
): Promise<Playlist[]> => {
  const data = await customGet(
    'https://api.spotify.com/v1/me/playlists',
    session
  );
  await saveUserData(session.user.name, data.items, session);

  return data.items;
};

async function saveUserData(
  userName: string,
  playlistsData: any,
  session: AuthSession
) {
  try {
    const dirPath = `userData`;
    const filePath = `${dirPath}/${userName}.json`;

    // await mkdir(dirPath, { recursive: true });
    await fsPromises.mkdir(dirPath, { recursive: true });

    let existingData: any = {};
    if (await fileExists(filePath)) {
      const fileContent = await fsPromises.readFile(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    }

    for (const playlist of playlistsData) {
      const playlistName = playlist.name;
      const tracks = await getPlaylistById(session, playlist.id);
      const trackItems = tracks.tracks.items.map((item: any) => ({
        name: item.track.name,
        artist: item.track.artists?.[0]?.name,
      }));

      // Only append if the playlist does not exist in the file
      if (!existingData[playlistName]) {
        existingData[playlistName] = trackItems;
      }
    }

    await fsPromises.writeFile(
      filePath,
      JSON.stringify(existingData, null, 2)
    );
    console.log(`Data saved for user ${userName}`);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}
const SEARCH_URL =
  'https://new.myfreemp3juices.cc/api/api_search.php?';

type TrackItem = {
  artist: string;
  title: string;
  url: string;
};

type MyMp3Response = {
  response: TrackItem[];
};
type TrackInfo = {
  artists: string;
  name: string;
};

export const sendRequestToMp3 = async () => {
  // console.log('Sending requests for links', savedTracks.length);

  // Read saved tracks from Json file in userData/Michael Bell.json
  const fileContent = await fsPromises.readFile(
    'userData/Michael Bell.json',
    'utf8'
  );

  // Structure of file is { "playlist" : {"name": "track name", "artist": "artist name"} }
  // {
  // "Pub Classics": [
  //   {
  //     "name": "My People",
  //     "artist": "The Presets"
  //   },

  const playlists = JSON.parse(fileContent);
  // Map through each playlist and download the tracks

  const playlistNames = Object.keys(playlists);

  for (const playlistName of playlistNames) {
    const playlist = playlists[playlistName];
    await mkdir(`Downloads/${playlistName}`, { recursive: true });
    for (const track of playlist) {
      try {
        const response = await axios({
          method: 'post',
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded; charset=UTF-8',
          },
          url: SEARCH_URL,
          data: {
            q: `${track.artist} - ${track.name}`,
            sort: '2',
          },
        });

        let jsonData = response.data.slice(0, -4);
        jsonData = jsonData.substring(1);

        const convertedResponse: MyMp3Response = JSON.parse(jsonData);

        // const selectedTrack = convertedResponse.response.find((track) => track.url)
        const selectedTrack =
          convertedResponse.response[1] ||
          convertedResponse.response.find((track) => track.url);
        // console.log(`${selectedTrack.artist} - ${selectedTrack.title}.mp3`)

        if (selectedTrack && selectedTrack.url) {
          console.log('SELECTED TRACK  URL', selectedTrack?.url);
          // tr.replace(/http:|www|.com/g, '')
          // replace(/[^a-zA-Z ]/g, ""
          // const replaceExp = new RegExp('/?|\'|_|#/g')
          // await downloadFile(selectedTrack.url, `Downloads/${selectedTrack.artist} - ${selectedTrack.title.replace('?','').replace('#','').replace('\\','').replace('+', '')}.mp3`)
          try {
            // Make a directory for each Playlist name
            const directory = `Downloads/${playlistName}/${selectedTrack.artist.replace(
              /[^a-zA-Z ]/g,
              ''
            )} - ${selectedTrack.title.replace(
              /[^a-zA-Z ]/g,
              ''
            )}.mp3`;

            await downloadFile(selectedTrack.url, directory);
          } catch (ex) {
            console.log('ERROR DOWNLOADING', ex);
            console.log(
              ` Finished downloading ${selectedTrack.artist} - ${selectedTrack.title}...`
            );
          }
        }
      } catch (ex) {
        console.log('ERROR:', ex);
      }
    }
  }
};
const finished = promisify(stream.finished);
export async function downloadFile(
  fileUrl: string,
  outputLocationPath: string
): Promise<any> {
  const writer = createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then((response) => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}

export const getPlaylistById = async (
  session: AuthSession,
  playlistId: string
): Promise<Playlist> => {
  const data = await customGet(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    session
  );
  const playlist = data;

  let limit = 50;
  let currUrl = data.tracks.next;

  while (currUrl !== null) {
    const nextData = await customGet(currUrl, session);
    playlist.tracks.items.push(...nextData.items);
    limit += 50;
    currUrl = nextData.next;
  }

  return playlist;
};

export const getCategories = async (
  session: AuthSession
): Promise<Category[]> => {
  const data = await customGet(
    `https://api.spotify.com/v1/browse/categories?limit=50&country=IN`,
    session
  );
  return data.categories.items;
};

export const getSearchItems = async (
  session: AuthSession,
  type: 'artist' | 'album' | 'track' | 'playlist' | 'all',
  query: string,
  limit = 5
) => {
  let searchType: string;
  if (type === 'all') {
    searchType = 'album,artist,track,playlist';
  } else {
    searchType = type;
  }

  return customGet(
    `https://api.spotify.com/v1/search?q=${query}&market=from_token&type=${searchType}&limit=${limit}`,
    session
  );
};

export const getTrackById = async (
  session: AuthSession,
  trackId: string
): Promise<Track> => {
  return customGet(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    session
  );
};

export const getTrackAnalysis = async (
  session: AuthSession,
  trackId: string
): Promise<TrackAnalysis> => {
  return customGet(
    `https://api.spotify.com/v1/audio-features/${trackId}`,
    session
  );
};

export const getTrackRecommendations = async (
  session: AuthSession,
  trackId: string
): Promise<Track[]> => {
  const trackAnalysis = await getTrackAnalysis(session, trackId);

  const trackFeatures = {
    acousticness: 1,
    danceability: 1,
    energy: 1,
    instrumentalness: 1,
    key: 1,
    liveness: 1,
    loudness: 1,
    mode: 1,
    speechiness: 1,
    tempo: 1,
    valence: 1,
  };

  const track = await getTrackById(session, trackId);
  const artist = await getArtistById(session, track.artists[0].id);

  let endpoint = `https://api.spotify.com/v1/recommendations?limit=30&seed_artists=${artist.id}&seed_tracks=${trackId}`;

  Object.entries(trackAnalysis).forEach(([key, value]) => {
    if (trackFeatures.hasOwnProperty(key)) {
      endpoint += `&target_${key}=${value}`;
    }
  });

  const data = await customGet(endpoint, session);

  return data.tracks;
};
