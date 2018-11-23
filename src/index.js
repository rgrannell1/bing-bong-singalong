
const playSchedule = (schedule, players) => {
  schedule.forEach(event => {
    players[event.track](event.midi).start(event.time)
  })
}

// bing: C
// bong: G# (lower)
// [0.83, 1.05]

const asTime = note => {
  return note.time
}

const createTrack = midi => {

  const synth = new Tone.PolySynth(8).toMaster()

  for (const track of midi.tracks) {
    new Tone.Part((time, note) => {
      synth.triggerAttackRelease(note.name, note.duration, time, note.velocity / 2)
    }, track.notes).start()
  }

  Tone.Transport.start()
}

const createBingBongSchedule = midi => {
  Tone.Transport.bpm.value = midi.header.bpm

  const schedule = []

  for (const track of midi.tracks) {
    let state = {
      lastNote: -Infinity
    }
    for (const note of track.notes) {
      const isGteLastNote = note.midi >= state.lastNote
      state.lastNote = note.midi

      schedule.push({
        time: asTime(note),
        note: note.midi,
        track: isGteLastNote ? 'bing' : 'bong'
      })
    }
  }

  return schedule
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
    players.bing().start('+0.5')
    players.bong().start('+1')
    players.bong().start('+1.5')
    players.bing().start('+2.0')
    players.bing().start('+2.25')
    players.bing().start('+2.5')
    players.bong().start('+3')
    players.bong().start('+3.5')
  }, 4000)
}

const percent = 0.05

const files = {}
files.bing = new Tone.Player({url: './data/bing.mp3'})
files.bong = new Tone.Player({url: './data/bong.mp3'})

const players = {
  bing (midi) {
    // diff from C4
    const centre = 60
    if (!midi) {
      return files.bing
    }
    const diff = Math.abs(centre - midi)
    const rate = 1 + (diff * percent)

    files.bing.playbackRate = rate
    return files.bing
  },
  bong (midi) {
    // diff from G#7
    const centre = 56
    if (!midi) {
      return files.bong
    }
    const diff = Math.abs(centre - midi)
    const rate = 1 + (diff * percent)

    files.bong.playbackRate = rate
    return files.bong
  }
}

const main = async () => {
  const source = document.getElementById('filereader');

  source.addEventListener('change', async event => {
    const midi = await readMidiFromFile(event)
    const schedule = createBingBongSchedule(midi)
    createTrack(midi)

    playSchedule(schedule, players)
  })

  //demo(players)

  players.bing().toMaster()
  players.bong().toMaster()
}

window.onload = () => {
  main()
}
