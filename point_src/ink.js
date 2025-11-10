function Ink(...args) {
  if (!new.target) return new Ink(...args);
  return new PointInk(...args);
}

class PointInk {
  constructor(stage, options = {}) {
    const state = { calls: 0, options };
    const stageRef = new WeakRef(stage);

    const head = (...args) => {
      state.calls++;
      const st = stageRef.deref();
      console.log('called with', args, 'calls:', state.calls, 'stage alive?', !!st);
      // use st safely: st?.draw?.(args);
    };

    head.state = state;
    head.getStage = () => stageRef.deref();

    Object.setPrototypeOf(head, Ink.prototype);
    Object.defineProperty(head, 'constructor', { value: Ink });

    return head;
  }

  eggs() {
    const st = this.getStage?.();
    console.log('eggs  -  stage alive?', !!st);
  }
}

Object.setPrototypeOf(Ink.prototype, PointInk.prototype);

// usage
const stage = { name: 'main' };
const ink = new Ink(stage, { color: 'cyan' });

ink();
ink.eggs();

// if stage has no strong refs, GC may collect it
console.log('stage now:', ink.getStage()); // possibly null after GC
