
const ticksToSeconds = (ticks, header) => {
  return (60 / header.bpm) * (ticks / header.PPQ);
}

const midiAsSchedule = midi => {
  const tracks = midi.track

  const schedules = tracks.map(track => {
    const playable = track.event.reduce((state, event) => {

      console.log(event.type)
      console.log(event.metaType)

      state.time += event.deltaTime
      state.schedule.push({
        track: 'bong',
        time: state.time / 1000
      })

      return state

    }, {
      time: 0,
      schedule: []
    })

    return playable.schedule
  })

  const events = []

  for (const schedule of schedules) {
    events.push(...schedule)
  }

  return events
}

const playSchedule = (schedule, players) => {
  schedule.forEach(event => {
    players.bong.start(event.time)
  })
}

// bing: C
// bong: G# (lower)
// [0.83, 1.05]

const readMidi = async event => {
  const file = event.target.files[0]
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = event => {
      resolve(MidiConvert.parse(event.target.result))
    }

    reader.readAsText(file)
  })
}

const demo = () => {
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
    const track = await readMidi(event)
    console.log(track)
    console.log('+++ +++ +++')
  })

  players.bing.toMaster()
  players.bong.toMaster()


  //playSchedule(track, players)

}

window.onload = () => {
  main()
}
