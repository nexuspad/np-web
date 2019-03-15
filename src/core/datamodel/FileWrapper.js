/**
 * Object to help file uploader.
 */
export default class FileWrapper {
  static WAITING = 'waiting';
  static UPLOADING = 'uploading';
  static CANCELLED = 'cancelled';
  static COMPLETED = 'completed';
  static FAILED = 'failed';

  file;
  uploadId;
  uploadProgress;
  status;

  constructor (file) {
    this.file = file;
    this.uploadProgress = 0;
    this.status = FileWrapper.WAITING;
    this.uploadId = '';
  }
}
