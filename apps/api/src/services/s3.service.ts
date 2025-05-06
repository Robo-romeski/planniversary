import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });
    this.bucket = process.env.AWS_S3_BUCKET || '';
  }

  /**
   * Generate a presigned URL for uploading a profile picture
   * @param userId - The user's ID
   * @param fileType - The MIME type of the file (e.g., 'image/jpeg')
   * @returns Object containing the upload URL and the final file URL
   */
  public async getProfilePictureUploadUrl(userId: string, fileType: string): Promise<{
    uploadUrl: string;
    fileUrl: string;
  }> {
    // Validate file type
    if (!fileType.startsWith('image/')) {
      throw new Error('Invalid file type. Only images are allowed.');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      throw new Error('Unsupported image type. Supported types: JPEG, PNG, GIF');
    }

    // Generate a unique file name
    const extension = fileType.split('/')[1];
    const fileName = `profile-pictures/${userId}/${randomUUID()}.${extension}`;

    // Create the command for uploading
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      ContentType: fileType
    });

    try {
      // Generate a presigned URL that expires in 5 minutes
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
      
      // Construct the final file URL
      const fileUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      return { uploadUrl, fileUrl };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Delete a profile picture from S3
   * @param fileUrl - The full URL of the file to delete
   */
  public async deleteProfilePicture(fileUrl: string): Promise<void> {
    try {
      // Extract the key from the file URL
      const urlParts = new URL(fileUrl);
      const key = urlParts.pathname.substring(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw new Error('Failed to delete profile picture');
    }
  }
} 