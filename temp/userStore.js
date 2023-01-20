import {
  action,
  makeObservable,
  observable,
} from 'mobx';

class UserStore {
  first_name = null;
  last_name = null;
  id = null;
  loggedIn = false;

  constructor() {
    makeObservable(this, {
      loggedIn: observable,
      id: observable,
      login: action,
      logout: action,
    });
  }

  login(f, l) {
    this.loggedIn = true;
    this.first_name = f;
    this.last_name = l;
  }

  logout() {
    // this.loggedIn = false;
    this.id = null;
  }
}

export const userStore = new UserStore();

// class ObservableTodoStore {
//   todos = [];
//   pendingRequests = 0;

//   constructor() {
//     makeObservable(this, {
//       todos: observable,
//       pendingRequests: observable,
//       completedTodosCount: computed,
//       report: computed,
//       addTodo: action,
//     });
//     autorun(() => console.log(this.report));
//   }

//   get completedTodosCount() {
//     return this.todos.filter(todo => todo.completed === true).length;
//   }

//   get report() {
//     if (this.todos.length === 0) return '<none>';
//     const nextTodo = this.todos.find(todo => todo.completed === false);
//     return (
//       `Next todo: "${nextTodo ? nextTodo.task : '<none>'}". ` +
//       `Progress: ${this.completedTodosCount}/${this.todos.length}`
//     );
//   }

//   addTodo(task) {
//     this.todos.push({
//       task: task,
//       completed: false,
//       assignee: null,
//     });
//   }
// }

// const observableTodoStore = new ObservableTodoStore();
