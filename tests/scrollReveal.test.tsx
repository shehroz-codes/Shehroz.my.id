import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useScrollReveal } from '../src/hooks/useScrollReveal';
function Content() { const ref = useScrollReveal<HTMLDivElement>('.item'); return <div ref={ref}><button className="item">Action</button></div>; }
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it('leaves content visible without browser animation capabilities', () => {
  const {getByRole} = render(<Content />);
  expect(getByRole('button').style.opacity).toBe('');
});
it('settles immediately with reduced motion and never creates an observer', () => {
  vi.stubGlobal('matchMedia', () => ({matches:true}));
  const observer = vi.fn();vi.stubGlobal('IntersectionObserver', observer);
  const {getByRole} = render(<Content />);
  expect(getByRole('button').dataset.revealState).toBe('visible');expect(observer).not.toHaveBeenCalled();
});
it('animates once on viewport entry and cancels on focus for immediate access', () => {
  vi.stubGlobal('matchMedia', () => ({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  const cancel=vi.fn();const animate=vi.fn(()=>({cancel,onfinish:null}));
  Object.defineProperty(Element.prototype,'animate',{configurable:true,value:animate});
  let callback: IntersectionObserverCallback;
  const unobserve=vi.fn();
  vi.stubGlobal('IntersectionObserver',class { constructor(cb:IntersectionObserverCallback){callback=cb;} observe(){} unobserve=unobserve; disconnect(){} });
  const {getByRole}=render(<Content />);const target=getByRole('button');
  act(()=>callback([{target,isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));
  expect(animate).toHaveBeenCalledTimes(1);expect(target.dataset.revealState).toBe('revealing');expect(unobserve).toHaveBeenCalledWith(target);
  act(()=>target.focus());expect(cancel).toHaveBeenCalled();expect(target.dataset.revealState).toBe('visible');
  act(()=>callback([{target,isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));expect(animate).toHaveBeenCalledTimes(1);
  Reflect.deleteProperty(Element.prototype,'animate');
});

it('keeps all items readable when IntersectionObserver is missing', () => {
  vi.stubGlobal('matchMedia', () => ({matches:false}));
  vi.stubGlobal('IntersectionObserver', undefined);
  const {getByRole} = render(<Content />);
  expect(getByRole('button').dataset.revealState).toBe('visible');
  expect(getByRole('button').style.opacity).toBe('');
});
