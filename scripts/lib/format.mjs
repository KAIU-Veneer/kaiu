import fs from 'node:fs';

/** Bytes as megabytes, one decimal. */
export const mb = (bytes) => (bytes / 1048576).toFixed(1);

/** A file's size as megabytes, one decimal. */
export const fileMb = (file) => mb(fs.statSync(file).size);
