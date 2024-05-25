import { NextApiHandler } from 'next';
import { NextResponse } from 'next/server';
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
  tracks: { name: string; artist: string }[]
) => {
  console.log('Sending requests for links', tracks.length);
  console.log('TRACKS RECEIVED', tracks);

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

      const selectedTrack =
        convertedResponse.response[1] ||
        convertedResponse.response.find((track) => track.url);

      if (selectedTrack && selectedTrack.url) {
        console.log('SELECTED TRACK URL', selectedTrack.url);
        try {
          const directory = `Downloads/${selectedTrack.artist} - ${selectedTrack.title}.mp3`;
          await downloadFile(selectedTrack.url, directory);
        } catch (ex) {
          console.log('ERROR DOWNLOADING', ex);
        }
      }
    } catch (ex) {
      console.log('ERROR:', ex);
    }
  }
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
    return finished(writer); // this is a Promise
  });
}

export async function GET(request: Request) {
  return new Response('Hello world');
}

export async function HEAD(request: Request) {}

export async function POST(request: Request) {
  const playlist = await request.json();

  console.log('REQUEST TRACKS', playlist.tracks);

  await Promise.all(
    playlist.tracks.map(async (track: any) => {
      await sendRequestToMp3([track]);
    })
  );

  return new Response(
    JSON.stringify({ message: 'Download initiated' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}

export async function OPTIONS(request: Request) {}
