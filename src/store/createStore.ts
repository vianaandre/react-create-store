import { useSyncExternalStore } from 'react';

type SetterFn<TState> = (prevState: TState) => Partial<TState>;
type SetStateFn<TState> = (
  partialState: Partial<TState> | SetterFn<TState>,
) => void;

export function createStore<TState>(
  createState: (
    setStateParam: SetStateFn<TState>,
    getStateParam: () => TState,
  ) => TState,
) {
  let state: TState;
  let listeners: Set<() => void>;

  function notifyListeners() {
    listeners.forEach((listener) => listener());
  }

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    const newState =
      typeof partialState === 'function' ? partialState(state) : partialState;

    state = {
      ...state,
      ...newState,
    };

    notifyListeners();
  }

  function getState() {
    return state;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function useStore<TValue>(
    selector: (currentState: TState) => TValue,
  ): TValue {
    return useSyncExternalStore(subscribe, () => selector(state));
  }

  state = createState(setState, getState);
  listeners = new Set<() => void>();

  return useStore;
}
