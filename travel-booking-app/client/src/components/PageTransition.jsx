import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

/**
 * PageTransition — wraps page content with a smooth entrance animation
 * that triggers on every route change.
 *
 * Usage: <PageTransition><YourPage /></PageTransition>
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('enter');
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      // Fade out
      setTransitionStage('exit');
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('enter');
        prevPath.current = location.pathname;
      }, 200);
      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  return (
    <div
      className={`transition-all duration-200 ${
        transitionStage === 'enter'
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      }`}
    >
      {displayChildren}
    </div>
  );
}
