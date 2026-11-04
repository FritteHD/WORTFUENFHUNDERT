import React, { useEffect, useRef, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const VIDEO_SRC = `${import.meta.env.BASE_URL}easter/boxen.mp4`;
/** Explosion (CapCut effect) shown behind the video while it spins in */
const EXPLOSION_SRC = `${import.meta.env.BASE_URL}easter/capcut-capcut-effect.gif`;
/** Duration of the spin-in */
const SPIN_MS = 1600;
/** The video starts playing this long before the spin is finished */
const PLAY_BEFORE_SPIN_END_MS = 500;

/**
 * Easter egg for the guess "BOXEN": the video spins in and grows
 * in front of an explosion (which disappears when the spin ends). Playback
 * starts shortly before the spin is finished. Closes when it ends, on click outside, ✕ or Escape.
 */
export const EasterEggVideo: React.FC<Props> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsTapForSound, setNeedsTapForSound] = useState(false);
  const [spinning, setSpinning] = useState(true);

  // Escape closes; swallow all other keys so they don't type into the game
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [isOpen, onClose]);

  // Start the video shortly before the spin ends
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;
      video.play().catch(() => {
        // Browser blocked sound without a fresh tap: play muted and offer to unmute
        video.muted = true;
        setNeedsTapForSound(true);
        video.play().catch(() => {});
      });
    }, SPIN_MS - PLAY_BEFORE_SPIN_END_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const endSpin = (e: React.AnimationEvent) => {
    // Only react to the spin-in itself, not to animations of child elements
    if (e.target !== e.currentTarget || e.animationName !== 'easter-spin') return;
    setSpinning(false); // explosion ends together with the spin
  };

  const enableSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setNeedsTapForSound(false);
    video.play().catch(() => {});
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-6 overflow-hidden animate-easter-backdrop"
      onClick={onClose}
    >
      {/* Explosion behind the spinning video, square and larger than the screen so its edges stay off-screen;
          gone once the spin ends */}
      {spinning && (
        <img
          src={EXPLOSION_SRC}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(140vw,140vh)] h-[max(140vw,140vh)] max-w-none object-cover"
        />
      )}
      <div
        className="relative z-10 animate-easter-spin"
        style={{ animationDuration: `${SPIN_MS}ms` }}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={endSpin}
      >
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          className="block w-auto h-auto max-w-[88vw] max-h-[80vh] rounded-2xl shadow-2xl bg-black"
          playsInline
          preload="auto"
          onEnded={onClose}
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-panel text-fg border border-line shadow-lg flex items-center justify-center font-bold hover:bg-control-hover"
          aria-label="Video schließen"
        >
          ✕
        </button>
        {needsTapForSound && (
          <button
            onClick={enableSound}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/70 text-white text-sm font-bold"
          >
            🔊 Tippen für Ton
          </button>
        )}
      </div>
    </div>
  );
};
