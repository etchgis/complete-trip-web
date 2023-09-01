import { useEffect, useRef } from 'react';

//NOTE see this post on how to use this hook
//https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useIntervalHook = (callback, delay) => {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default useIntervalHook;
