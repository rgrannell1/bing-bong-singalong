
const constants = {
  tones: {
    bing: 60,
    bong: 56,
  },
  tonelessness: {
    bing: 0.2,
    bong: 0.3
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

const playNote = (track) => {
  const state = {lastNote: -Infinity}

  const synth = new Tone.PolySynth(8)
    .toMaster()

  synth.volume.value = -25

  new Tone.Part((time, note) => {
    const player = note.midi >= state.lastNote ? 'bing' : 'bong'

    const diff = (note.midi - constants.tones[player])
    state.lastNote = note.midi

    players.bing.disconnect()
    players.bong.disconnect()

    players[player]
      .chain(
        new Tone.PitchShift({pitch: offsets[player](diff, player)}),
        Tone.Master
      )
      .start(time)

    synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)

  }, track.notes).start()
}

const createTrack = midi => {
  for (const track of midi.tracks) {
    playNote(track)
  }

  Tone.Transport.start()
}

const readMidiFromFile = async event => {
  const file = event.target.files[0]
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = event => {
      resolve(MidiConvert.parse(event.target.result))
    }

    reader.readAsBinaryString(file)
  })
}

const demo = players => {
  setInterval(() => {
    players.bing.start('+0.5')
    players.bong.start('+1')
    players.bong.start('+1.5')
    players.bing.start('+2.0')
    players.bing.start('+2.25')
    players.bing.start('+2.5')
    players.bong.start('+3')
    players.bong.start('+3.5')
  }, 4000)
}

const percent = 0.05

const files = {}

const players = {
  bing: new Tone.Player({url: './data/bing.mp3'}),
  bong: new Tone.Player({url: './data/bong.mp3'})
}

const main = async () => {
  const source = document.getElementById('filereader');

  source.addEventListener('change', async event => {
    const midi = await readMidiFromFile(event)
    Tone.Transport.bpm.value = midi.header.bpm
    createTrack(midi)
  })

  //demo(players)

  players.bing.toMaster()
  players.bong.toMaster()
}

window.onload = () => {
  main()
}
