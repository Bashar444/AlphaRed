import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    bucket: process.env.DO_SPACES_BUCKET,
    key: process.env.DO_SPACES_KEY,
    secret: process.env.DO_SPACES_SECRET,
    cdnUrl: process.env.DO_SPACES_CDN_URL,
}));
