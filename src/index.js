
const playSchedule = (schedule, players) => {
  schedule.forEach(event => {
    players[event.track].start(event.time)
  })
}

// bing: C
// bong: G# (lower)
// [0.83, 1.05]

const createBingBongSchedule = midi => {
  const schedule = []

  for (const track of midi.tracks) {
    let state = {
      lastNote: -Infinity
    }
    for (const note of track.notes) {
      const isGteLastNote = note.midi >= state.lastNote
      state.lastNote = note.midi

      schedule.push({
        time: note.time,
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

const main = async () => {
  const players = {
    bing: new Tone.Player({url: './data/bing.mp3', playbackRate: 1}),
    bong: new Tone.Player({url: './data/bong.mp3', playbackRate: 1})
  }

  const source = document.getElementById('filereader');

  source.addEventListener('change', async event => {
    const midi = await readMidiFromFile(event)
    const schedule = createBingBongSchedule(midi)

    playSchedule(schedule, players)
  })

  //demo(players)

  players.bing.toMaster()
  players.bong.toMaster()
}

window.onload = () => {
  main()
}
