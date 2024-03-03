// Assuming the use of app/api for API routes, adjust according to your project structure

import { NextApiHandler } from 'next';
import { NextResponse } from 'next/server';

// app/api/hello.js

import { mkdir, writeFile } from 'fs/promises';
import {
  promises as fsPromises,
  constants as fsConstants,
  createWriteStream,
} from 'fs';
import { finished } from 'stream/promises';
import axios from 'axios';

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

export const sendRequestToMp3 = async (
  tracks: {
    name: string;
    artist: string;
  }[]
) => {
  console.log('Sending requests for links', tracks.length);

  // Read saved tracks from Json file in userData/Michael Bell.json
  // const fileContent = await fsPromises.readFile(
  //   'userData/Michael Bell.json',
  //   'utf8'
  // );

  // const playlists = JSON.parse(fileContent);
  // Map through each playlist and download the tracks

  // const playlistNames = Object.keys(playlists);

  for (const track of tracks) {
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

      console.log('RESPONSE', response.data);

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
          const directory = `Downloads/${selectedTrack.artist} - ${selectedTrack.title}.mp3`;

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

  // for (const playlistName of playlistNames) {
  //   const playlist = playlists[playlistName];
  //   await mkdir(`Downloads/${playlistName}`, { recursive: true });
  //   for (const track of playlist) {
  //     try {
  //       const response = await axios({
  //         method: 'post',
  //         headers: {
  //           'Content-Type':
  //             'application/x-www-form-urlencoded; charset=UTF-8',
  //         },
  //         url: SEARCH_URL,
  //         data: {
  //           q: `${track.artist} - ${track.name}`,
  //           sort: '2',
  //         },
  //       });

  //       let jsonData = response.data.slice(0, -4);
  //       jsonData = jsonData.substring(1);

  //       const convertedResponse: MyMp3Response = JSON.parse(jsonData);

  //       // const selectedTrack = convertedResponse.response.find((track) => track.url)
  //       const selectedTrack =
  //         convertedResponse.response[1] ||
  //         convertedResponse.response.find((track) => track.url);
  //       // console.log(`${selectedTrack.artist} - ${selectedTrack.title}.mp3`)

  //       if (selectedTrack && selectedTrack.url) {
  //         console.log('SELECTED TRACK  URL', selectedTrack?.url);
  //         // tr.replace(/http:|www|.com/g, '')
  //         // replace(/[^a-zA-Z ]/g, ""
  //         // const replaceExp = new RegExp('/?|\'|_|#/g')
  //         // await downloadFile(selectedTrack.url, `Downloads/${selectedTrack.artist} - ${selectedTrack.title.replace('?','').replace('#','').replace('\\','').replace('+', '')}.mp3`)
  //         try {
  //           // Make a directory for each Playlist name
  //           const directory = `Downloads/${playlistName}/${selectedTrack.artist.replace(
  //             /[^a-zA-Z ]/g,
  //             ''
  //           )} - ${selectedTrack.title.replace(
  //             /[^a-zA-Z ]/g,
  //             ''
  //           )}.mp3`;

  //           await downloadFile(selectedTrack.url, directory);
  //         } catch (ex) {
  //           console.log('ERROR DOWNLOADING', ex);
  //           console.log(
  //             ` Finished downloading ${selectedTrack.artist} - ${selectedTrack.title}...`
  //           );
  //         }
  //       }
  //     } catch (ex) {
  //       console.log('ERROR:', ex);
  //     }
  //   }
  // }
};

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
export async function GET(request: Request) {
  return new Response('Hello world');
}

export async function HEAD(request: Request) {}

export async function POST(request: Request) {
  const playlist = await request.json().then((data) => data.tracks);

  console.log('REQUEST TRACKS', playlist);

  await Promise.all(
    playlist.forEach(async (playlist: any) => {
      await sendRequestToMp3(playlist);
    })
  );

  // Create a file to test
  // await sendRequestToMp3([
  //   {
  //     name: 'Solar system',
  //     artist: 'Sub Focus',
  //   },
  // ]);

  // Write file to the file system

  return new Response(playlist);
}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}

// If `OPTIONS` is not defined, Next.js will automatically implement `OPTIONS` and  set the appropriate Response `Allow` header depending on the other methods defined in the route handler.
export async function OPTIONS(request: Request) {}
