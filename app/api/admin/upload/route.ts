import { putBinaryObject } from "@/lib/s3/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const ext = file.type.split("/")[1].replace("svg+xml", "svg");
    const timestamp = Date.now();
    const safeName = file.name
      ? file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-]/gi, "-").toLowerCase()
      : "image";
    const key = `images/${safeName}-${timestamp}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await putBinaryObject(key, buffer, file.type);

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ url });
  } catch (e) {
    console.error("Failed to upload image:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
