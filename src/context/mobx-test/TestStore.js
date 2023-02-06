import { makeAutoObservable } from 'mobx';

export default class Timer {
  s = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increaseTimer = () => {
    console.log(this);
    this.s += 1;
  };

  decreaseTimer() {
    console.log(this);
    this.s += 1;
  }
}
