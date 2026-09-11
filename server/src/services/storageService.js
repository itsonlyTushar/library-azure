import { BlobServiceClient } from "@azure/storage-blob";
import { STORAGE } from "../config.js";

// CREATE THE STORAGE CLIENT ONLY WHEN A CATALOG OPERATION NEEDS IT.
let containerClientPromise = null;

function getContainerClient() {
  if (!STORAGE.connectionString) {
    throw new Error(
      "Azure Blob Storage is not configured (set AZURE_STORAGE_CONNECTION_STRING)"
    );
  }
  if (!containerClientPromise) {
    containerClientPromise = (async () => {
      const service = BlobServiceClient.fromConnectionString(
        STORAGE.connectionString
      );
      const container = service.getContainerClient(STORAGE.container);
      // ENSURE THE PUBLIC COVER-IMAGE CONTAINER EXISTS.
      await container.createIfNotExists({ access: "blob" });
      return container;
    })();
  }
  return containerClientPromise;
}

export function isStorageConfigured() {
  return Boolean(STORAGE.connectionString);
}

export async function uploadImage(blobName, data, contentType = "image/jpeg") {
  const container = await getContainerClient();
  const blockBlob = container.getBlockBlobClient(blobName);
  await blockBlob.uploadData(data, {
    blobHTTPHeaders: {
      blobContentType: contentType,
      blobCacheControl: "public, max-age=31536000, immutable",
    },
  });
  return blockBlob.url;
}

export async function deleteImage(blobName) {
  const container = await getContainerClient();
  await container.getBlockBlobClient(blobName).deleteIfExists();
}
