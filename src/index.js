
'use strict'

const constants = {
  tones: {
    bing: 60,
    bong: 56,
  },
  tonelessness: {
    bing: 0.2,
    bong: 0.3
  },
  paths: {
    bing: './data/bing.mp3',
    bong: './data/bong.mp3'
  }
}

const randomOffset = () => {
  return (Math.random() - (1 / 2)) / 2
}

const offsets = {}

offsets.bing = diff => {
  return diff * constants.tonelessness.bing + randomOffset()
}

offsets.bong = diff => {
  return diff * constants.tonelessness.bong + randomOffset()
}

const synth = new Tone.PolySynth(8).toMaster()
synth.volume.value = -55

const playNote = (track) => {
  const state = {lastNote: -Infinity}

  new Tone.Part((time, note) => {
    const player = note.midi >= state.lastNote ? 'bing' : 'bong'

    const diffFromPlayerNote = note.midi - constants.tones[player]
    state.lastNote = note.midi

    players.bing.disconnect()
    players.bong.disconnect()

    players[player]
      .chain(
        new Tone.PitchShift({pitch: offsets[player](diffFromPlayerNote, player)}),
        Tone.Master
      )
      .start(time)

    synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)

  }, track.notes).start()
}

const readMidi = async event => {
  const file = event.target.files[0]
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = event => {
      resolve(MidiConvert.parse(event.target.result))
    }

    reader.readAsBinaryString(file)
  })
}

const players = {
  bing: new Tone.Player({url: constants.paths.bing}),
  bong: new Tone.Player({url: constants.paths.bong})
}

const main = async () => {
  const source = document.getElementById('filereader');

  source.addEventListener('change', async event => {
    players.bing.toMaster()
    players.bong.toMaster()

    const midi = await readMidi(event)
    Tone.Transport.bpm.value = midi.header.bpm

    for (const track of midi.tracks) {
      playNote(track)
    }

    Tone.Transport.start()
  })
}

window.onload = () => {
  main()
}
