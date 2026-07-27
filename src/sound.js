// Web Audio Engine with Splice High-Quality Audio Samples for TYPO99
import clickUrl from './assets/sounds/wv_button_click_general.mp3';
import hoverUrl from './assets/sounds/wv_button_hovermp3.mp3';
import eraseUrl from './assets/sounds/wv_key_erase.mp3';
import inputUrl from './assets/sounds/wv_key_input.mp3';
import countdownUrl from './assets/sounds/wv_pregame_countdown.mp3';
import goUrl from './assets/sounds/wv_pregame_go!.mp3';
import rightUrl from './assets/sounds/wv_right_answer.mp3';
import startUrl from './assets/sounds/wv_start_but.mp3';
import wrongUrl from './assets/sounds/wv_wrong_answer.mp3';

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.urls = {
      click: clickUrl,
      hover: hoverUrl,
      erase: eraseUrl,
      input: inputUrl,
      countdown: countdownUrl,
      go: goUrl,
      right: rightUrl,
      start: startUrl,
      wrong: wrongUrl,
    };
    this.loadingPromise = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.preload();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  async preload() {
    if (!this.ctx || this.loadingPromise) return;
    this.loadingPromise = (async () => {
      for (const [key, url] of Object.entries(this.urls)) {
        try {
          const res = await fetch(url);
          const arrayBuf = await res.arrayBuffer();
          this.buffers[key] = await this.ctx.decodeAudioData(arrayBuf);
        } catch (e) {
          console.warn('Failed to decode audio buffer:', key, e);
        }
      }
    })();
  }

  playBuffer(key, volume = 0.5, rate = 1.0) {
    this.init();
    const buf = this.buffers[key];
    if (this.ctx && buf) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = buf;
        source.playbackRate.value = rate;
        
        const gain = this.ctx.createGain();
        gain.gain.value = volume;
        
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(0);
      } catch (e) {}
    } else {
      // Fallback if AudioContext buffer is loading or suspended
      try {
        const audio = new Audio(this.urls[key]);
        audio.volume = volume;
        audio.playbackRate = rate;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  }

  // Keyboard typing / digit input
  playKeyInput() {
    this.playBuffer('input', 0.45);
  }

  // Backspace / Erase key
  playDelete() {
    this.playBuffer('erase', 0.5);
  }

  // UI Button click
  playType() {
    this.playBuffer('click', 0.4);
  }

  // Menu hover swoosh
  playSwoosh() {
    this.playBuffer('hover', 0.3);
  }

  // Correct answer chime
  playCorrect() {
    this.playBuffer('right', 0.55);
  }

  // Wrong answer shatter sound
  playWrong() {
    this.playBuffer('wrong', 0.6);
  }

  // Countdown beep (3, 2, 1)
  playCountdown() {
    this.playBuffer('countdown', 0.65);
  }

  // GO! start signal
  playGo() {
    this.playBuffer('go', 0.7);
  }

  // Game start button click / Clear sound
  playStart() {
    this.playBuffer('start', 0.65);
  }
}

export const sound = new SoundEngine();
