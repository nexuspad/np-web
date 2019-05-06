export default class NPJob {
  updateTime;
  jobId;
  title;
  downloadLink;
  status;

  constructor (data) {
    if (data) {
      this.jobId = data['jobId'];
      this.updateTime = new Date(data['updateTime']);
      this.title = data['title'];
      this.downloadLink = data['downloadLink'];
      this.status = data['status'];
    }
  }
}
