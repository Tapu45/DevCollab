import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Helper to upload buffer to Cloudinary
function uploadBufferToCloudinary(buffer: Buffer, options = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto', ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}

// Upload single file
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as unknown as { arrayBuffer: () => Promise<ArrayBuffer> };

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadBufferToCloudinary(buffer, { folder: 'uploads' });

    return NextResponse.json({ success: true, data: uploadResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Upload multiple files
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as unknown as Array<{ arrayBuffer: () => Promise<ArrayBuffer> }>;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return uploadBufferToCloudinary(buffer, { folder: 'uploads' });
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({ success: true, files: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete file
export async function DELETE(req: NextRequest) {
  try {
    const { public_id } = await req.json();

    if (!public_id) {
      return NextResponse.json({ error: 'No public_id provided' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(public_id);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}