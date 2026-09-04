import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Jimp } from "jimp";

const s3 = new S3Client({});

const DEST_BUCKET = process.env.DEST_BUCKET;

export const handler = async (event) => {
  try {
    const record = event.Records[0];

    const sourceBucket = record.s3.bucket.name;
    const objectKey = decodeURIComponent(
      record.s3.object.key.replace(/\+/g, " ")
    );

    console.log(`Processing ${objectKey} from ${sourceBucket}`);

    // Get original image from S3
    const getObjectResponse = await s3.send(
      new GetObjectCommand({
        Bucket: sourceBucket,
        Key: objectKey,
      })
    );

    const imageBuffer = Buffer.from(
      await getObjectResponse.Body.transformToByteArray()
    );

    // Read image
    const image = await Jimp.read(imageBuffer);

    // Resize to 200x200
    image.resize({ w: 200, h: 200 });

    // Convert to JPEG
    const resizedBuffer = await image.getBuffer("image/jpeg");

    // Save resized image
    await s3.send(
      new PutObjectCommand({
        Bucket: DEST_BUCKET,
        Key: objectKey,
        Body: resizedBuffer,
        ContentType: "image/jpeg",
      })
    );

    console.log(
      `Successfully resized ${objectKey} and uploaded it to ${DEST_BUCKET}`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image resized successfully",
        sourceBucket,
        destinationBucket: DEST_BUCKET,
        objectKey,
      }),
    };
  } catch (error) {
    console.error("Image resizing failed:", error);
    throw error;
  }
};