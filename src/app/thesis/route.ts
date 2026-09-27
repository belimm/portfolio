import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
   const filePath = path.join(
      process.cwd(),
      'public',
      'thesis.pdf'
   );
   const fileBuffer = await readFile(filePath);

   return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
         'Content-Type': 'application/pdf',
         'Content-Disposition': 'inline; filename="thesis.pdf"',
      },
   });
}
