import { ListObjectsV2Command, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { RavinConfig } from '@/lib/ravin/config';
import { parseRavinReportPayload } from '@/lib/ravin/parse-report';
import type { RavinParsedReport } from '@/types/ravin';

function getResultsS3Client(): S3Client | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  if (!accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: { accessKeyId, secretAccessKey },
  });
}

const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'pre-delivery-inspections';

/** Poll customer S3 prefix for new Ravin JSON result files (outbound S3 push). */
export async function listPendingRavinResultKeys(
  config: RavinConfig,
  processedKeys: Set<string>
): Promise<string[]> {
  const client = getResultsS3Client();
  if (!client) return [];

  const prefix = config.s3ResultsPrefix || 'ravin-results/';
  const res = await client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      MaxKeys: 100,
    })
  );

  const keys: string[] = [];
  for (const obj of res.Contents || []) {
    if (!obj.Key || processedKeys.has(obj.Key)) continue;
    if (!/\.json$/i.test(obj.Key)) continue;
    keys.push(obj.Key);
  }
  return keys;
}

export async function loadRavinResultFromS3(key: string): Promise<RavinParsedReport | null> {
  const client = getResultsS3Client();
  if (!client) return null;

  const res = await client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  const body = await res.Body?.transformToString('utf-8');
  if (!body) return null;

  try {
    return parseRavinReportPayload(JSON.parse(body));
  } catch {
    return null;
  }
}
