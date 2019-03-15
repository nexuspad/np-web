export default class TaskMaster {
  static SYNC_PREFERENCE = 'syncPreference';

  static tasks = new Map();

  static schedule (task) {
    if (!TaskMaster.tasks.get(task.name)) {
      console.log('schedule task: ' + task.name)
      task.id = setInterval(task.funcRef, task.interval);
      TaskMaster.tasks.set(task.name, task);
    }
  }

  static remove (task) {
    let t = TaskMaster.tasks.get(task.name);
    if (t) {
      clearInterval(t.id);
      TaskMaster.tasks.remove(task.name);
    }
  }

  static clearAll () {
    if (TaskMaster.tasks) {
      TaskMaster.tasks.forEach(t => {
        clearInterval(t.id);
      });
      TaskMaster.tasks.clear();
    }
  }
}
