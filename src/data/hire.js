/**
 * Copy for the /hire page ("Work with me"). The page renders whatever is here,
 * so services, formats, the rate and the brief checklist are all edited in this
 * one file.
 *
 * Keep it checkable: every claim should be backed by a project page. Credits
 * are slugs, not copy — title, client, year, award and role come from
 * projects.js, so this page can never disagree with the project it links to.
 */
export const hire = {
  title: 'Work with me',

  lead:
    'FX and lookdev for game cinematics, trailers and short films. Simulation in Houdini, ' +
    'real-time shots in Unreal, the final look in Nuke. Remote, worldwide.',

  services: [
    {
      title: 'FX shots',
      text:
        'Houdini simulation for the moments a shot is built around: fire and smoke, ' +
        'destruction, water, cloth, magic and energy. Delivered as render passes, or as ' +
        'caches that drop into your scene.',
    },
    {
      title: 'Unreal cinematics',
      text:
        'Shots built and rendered in Unreal Engine 5: Niagara effects, volumes, light and ' +
        'Sequencer, through Lumen or the path tracer.',
    },
    {
      title: 'Lookdev and final look',
      text:
        'Materials, light and the grade that make a film read as one piece: post-process ' +
        'in Unreal and the Nuke comp after it.',
    },
    {
      title: 'Render and comp',
      text:
        'Scene assembly, rendering in Octane, Redshift, Karma or Unreal, and compositing ' +
        'to a finished frame.',
    },
    {
      title: 'Tools',
      text:
        'Houdini HDAs, Cinema 4D plugins and Python tools for the repetitive parts of a ' +
        'pipeline. The same kind I sell in my stores.',
      link: { to: '/assets', label: 'See the stores' },
    },
  ],

  formats: [
    {
      title: 'Shot package',
      text: 'One shot or a sequence, from brief to final frame, at a fixed price agreed after the brief.',
    },
    {
      title: 'FX for your shots',
      text: 'You send the scene, camera and animation. I send back FX passes or caches built for your comp.',
    },
    {
      title: 'Days on your team',
      text: 'Remote, on your pipeline and your schedule, booked by the day or the week.',
    },
    {
      title: 'Collaborations',
      text: 'Short films, contest entries, tutorials and joint tool releases with other artists and studios.',
    },
  ],

  process: [
    {
      title: 'Brief',
      text: 'What the shot is, how long, the deadline and the references. I answer with questions or a quote.',
    },
    {
      title: 'Blockout',
      text: 'Timing and shape at low resolution, while changes are still cheap.',
    },
    {
      title: 'Look',
      text: 'Full-resolution simulation, light and comp on top of the approved blockout.',
    },
    {
      title: 'Delivery',
      text: 'Final frames or EXR passes, caches, and project files when agreed.',
    },
  ],

  // Slugs from projects.js, in the order shown. Only published (`real`)
  // projects render, so a slug for an unfinished page is silently skipped.
  credits: ['lamborghini-temerario', 'sphere-master', 'divine-rampage', 'vaio-fe'],

  // Empty = every job is quoted after the brief, and only `rateNote` shows.
  // To publish a number, set it here, e.g. 'Day rate from €250.'
  rate: '',
  rateNote:
    'Shots and packages are priced after the brief. Send what you have and I will come ' +
    'back with a price and a timeline.',

  brief: [
    'What the shot or film is',
    'Length and number of shots',
    'Deadline',
    'Budget, if you have one',
    'References',
    'Software and delivery format',
  ],

  // Labels from profile.socials, in button order; the first is the solid one.
  // If profile.email is set, an Email button is added first.
  contact: ['Telegram', 'Instagram'],
}
