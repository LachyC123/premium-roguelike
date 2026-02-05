let audioSystem = null;

export function setupAudio(scene) {
  if (!scene.sound) {
    return;
  }

  if (scene.sound.locked) {
    scene.input.once("pointerdown", () => {
      scene.sound.unlock();
    });
  }
}

export function createAudioSystem(scene) {
  if (!audioSystem) {
    audioSystem = {
      play(key) {
        if (!scene.sound || !scene.cache.audio.exists(key)) {
          return;
        }
        scene.sound.play(key, { volume: 0.5 });
      },
    };
  }

  return audioSystem;
}
