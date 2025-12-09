import archiver from 'archiver';
import { NextRequest } from 'next/server';
import pLimit from 'p-limit';
import sharp from 'sharp';
import { PassThrough, Readable } from 'stream';

interface ProcessedFile {
  buffer: Buffer;
  filename: string;
}

const MAX_FILES = 50;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TARGET_MIN = 200 * 1024;
const TARGET_MAX = 300 * 1024;

function toNodeStream(buffer: Buffer) {
  return Readable.from(buffer);
}

async function compressToTarget(input: Buffer) {
  const resized = await sharp(input)
    .resize(1000, 1000, { fit: 'cover', position: 'center' })
    .toFormat('webp', { quality: 90 })
    .toBuffer();

  let low = 40;
  let high = 95;
  let best = { buffer: resized, size: resized.length, quality: 90 };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const buf = await sharp(resized).toFormat('webp', { quality: mid }).toBuffer();
    const size = buf.length;
    if (Math.abs(size - TARGET_MIN) < Math.abs(best.size - TARGET_MIN)) {
      best = { buffer: buf, size, quality: mid };
    }
    if (size > TARGET_MAX) low = mid + 1;
    else if (size < TARGET_MIN) high = mid - 1;
    else break;
  }

  return best.buffer;
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const prefix = (form.get('prefix') as string) || '';
    const start = Number(form.get('start') || 1);
    const files = form.getAll('files') as File[];

    if (!files.length) return new Response('No files uploaded', { status: 400 });
    if (files.length > MAX_FILES) return new Response('Too many files', { status: 400 });

    const limit = pLimit(4);
    const processed: ProcessedFile[] = await Promise.all(
      files.map((file, index) =>
        limit(async () => {
          if (file.size > MAX_FILE_SIZE) throw new Error(`文件过大: ${file.name}`);
          const arrayBuffer = await file.arrayBuffer();
          const input = Buffer.from(arrayBuffer);
          const output = await compressToTarget(input);
          const base = prefix.trim() || file.name.replace(/\.[^.]+$/, '') || 'image';
          const filename = `${base}-${start + index}.webp`;
          return { buffer: output, filename };
        }),
      ),
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();
    archive.on('error', (err) => {
      stream.destroy(err);
    });
    archive.pipe(stream);

    processed.forEach(({ buffer, filename }) => {
      archive.append(toNodeStream(buffer), { name: filename });
    });
    void archive.finalize();

    const webStream = Readable.toWeb(stream) as unknown as ReadableStream;

    return new Response(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="images.zip"',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return new Response(message, { status: 500 });
  }
}

