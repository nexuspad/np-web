export default class FolderServiceData {
  /**
   * Build the service data object for updating activities.
   */
  static of (folder, action) {
    let serviceData = new FolderServiceData();
    serviceData.folder = folder;
    serviceData.updateAction = action;
    return serviceData;
  }

  convertToJsonForPosting () {
    return {
      folder: this.folder.toJson(),
      updateAction: this.updateAction
    };
  }
}
