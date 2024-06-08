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
  tracks: { name: string; artist: string }[],
  playlistName: string
) => {
  const failedDownloads: { artist: string; name: string }[] = [];

  const downloadPromises = tracks.map(async (track) => {
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

      if (
        !convertedResponse.response ||
        convertedResponse.response.length === 0
      ) {
        failedDownloads.push(track);
        return;
      }

      const selectedTrack =
        convertedResponse.response[1] ||
        convertedResponse.response.find((track) => track.url);

      if (selectedTrack && selectedTrack.url) {
        console.log('SELECTED TRACK URL', selectedTrack.url);
        try {
          const directory = `Downloads/${playlistName}`;
          await mkdir(directory, { recursive: true });

          const outputLocationPath = `${directory}/${selectedTrack.artist} - ${selectedTrack.title}.mp3`;

          if (await fileExists(outputLocationPath)) {
            console.log(`File already exists: ${outputLocationPath}`);
            return;
          }

          await downloadFile(selectedTrack.url, outputLocationPath);
        } catch (ex) {
          console.log('ERROR DOWNLOADING', ex);
          failedDownloads.push(track);
        }
      } else {
        failedDownloads.push(track);
      }
    } catch (ex) {
      console.log('ERROR:', ex);
      failedDownloads.push(track);
    }
  });

  await Promise.all(downloadPromises);

  if (failedDownloads.length > 0) {
    console.log('Failed Downloads:', failedDownloads);
  }
};

export async function downloadFile(
  fileUrl: string,
  outputLocationPath: string
): Promise<any> {
  const writer = createWriteStream(outputLocationPath);
  const response = await axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  });

  const totalLength = response.headers['content-length'];

  response.data.on('data', (chunk: any) => {
    const progress = (writer.bytesWritten / totalLength) * 100;
    process.stdout.write(
      `Downloading ${outputLocationPath}: ${progress.toFixed(2)}%\r`
    );
  });

  response.data.pipe(writer);
  return finished(writer); // this is a Promise
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fsPromises.access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  return new Response('Hello world');
}

export async function HEAD(request: Request) {}

export async function POST(request: Request) {
  const { tracks, playlistName } = await request.json();

  console.log('REQUEST TRACKS', tracks);

  await sendRequestToMp3(tracks, playlistName);

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
